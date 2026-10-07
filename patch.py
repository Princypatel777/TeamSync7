import re

def patch_page(file_path, entity_var):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'setEditingItem' not in content:
        content = content.replace(
            'const [isAddModalOpen, setIsAddModalOpen] = useState(false);',
            'const [isAddModalOpen, setIsAddModalOpen] = useState(false);\n  const [editingItem, setEditingItem] = useState(null);'
        )
        
        update_mutation = '''
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.put(/admin/users/, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsAddModalOpen(false);
      setEditingItem(null);
      resetForm();
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to update.');
    },
  });
'''
        content = content.replace('const create', update_mutation + '\n  const create')

        content = content.replace(
            'createFacultyMutation.mutate(formData);',
            'if(editingItem) { updateMutation.mutate(formData); } else { createFacultyMutation.mutate(formData); }'
        )
        content = content.replace(
            'createStudentMutation.mutate(payload);',
            'if(editingItem) { updateMutation.mutate(payload); } else { createStudentMutation.mutate(payload); }'
        )

        content = re.sub(
            r'onClick=\{.*?alert\(''Edit.*?\)\}',
            f'onClick={{() => {{ setEditingItem({entity_var}); setFormData({{ ...formData, name: {entity_var}.name, email: {entity_var}.email, role: {entity_var}.role, departmentId: {entity_var}.departmentId?._id || {entity_var}.departmentId || \"\" }}); setIsAddModalOpen(true); }}}}',
            content
        )
        
        content = content.replace('>Add Faculty</h3>', '>{editingItem ? \"Edit\" : \"Add\"} Faculty</h3>')
        content = content.replace('>Add Student</h3>', '>{editingItem ? \"Edit\" : \"Add\"} Student</h3>')
        
        content = content.replace('onClick={() => setIsAddModalOpen(false)}', 'onClick={() => { setIsAddModalOpen(false); setEditingItem(null); resetForm(); }}')
        content = content.replace('onClick={() => { setIsAddModalOpen(false); resetForm(); }}', 'onClick={() => { setIsAddModalOpen(false); setEditingItem(null); resetForm(); }}')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

patch_page('frontend/src/pages/admin/AdminFacultyPage.jsx', 'user')
patch_page('frontend/src/pages/admin/AdminStudentsPage.jsx', 'student')
