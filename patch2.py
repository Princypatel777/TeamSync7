def patch_file(fpath, varname):
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace("onClick={() => alert('Edit functionality to be implemented with API support')}", f"onClick={{() => {{ setEditingItem({varname}); setFormData({{ ...formData, name: {varname}.name, email: {varname}.email, role: {varname}.role }}); setIsAddModalOpen(true); }}}}")
    c = c.replace("Provision Faculty Account", "{editingItem ? 'Edit Faculty' : 'Provision Faculty Account'}")
    c = c.replace("Provision Student Account", "{editingItem ? 'Edit Student' : 'Provision Student Account'}")
    c = c.replace("Create Account", "{editingItem ? 'Save Changes' : 'Create Account'}")
    c = c.replace("disabled={createFacultyMutation.isPending}", "disabled={createFacultyMutation.isPending || updateMutation.isPending}")
    c = c.replace("disabled={createStudentMutation.isPending}", "disabled={createStudentMutation.isPending || updateMutation.isPending}")
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(c)

patch_file('frontend/src/pages/admin/AdminFacultyPage.jsx', 'user')
patch_file('frontend/src/pages/admin/AdminStudentsPage.jsx', 'student')
