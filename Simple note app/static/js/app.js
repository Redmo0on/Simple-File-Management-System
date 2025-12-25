const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        const notes = ref([]);
        const loading = ref(true);
        const showModal = ref(false);
        const showDeleteModal = ref(false);
        const isEditing = ref(false);
        const currentId = ref(null);
        const noteToDelete = ref(null);
        const darkMode = ref(localStorage.getItem('darkMode') === 'true');

        const form = ref({
            title: '',
            content: ''
        });

        const toggleDarkMode = () => {
            darkMode.value = !darkMode.value;
            localStorage.setItem('darkMode', darkMode.value);
            applyDarkMode();
        };

        const applyDarkMode = () => {
            if (darkMode.value) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        const API_URL = 'http://127.0.0.1:5000/api/notes';

        const fetchNotes = async () => {
            loading.value = true;
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Failed to fetch');
                notes.value = await response.json();
            } catch (error) {
                console.error('Error fetching notes:', error);
                alert('Failed to load notes. Is the backend running?');
            } finally {
                loading.value = false;
            }
        };

        const saveNote = async () => {
            if (!form.value.title || !form.value.content) return;

            try {
                const method = isEditing.value ? 'PUT' : 'POST';
                const url = isEditing.value ? `${API_URL}/${currentId.value}` : API_URL;

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form.value)
                });

                if (!response.ok) throw new Error('Failed to save');

                await fetchNotes(); 
                closeModal();
            } catch (error) {
                console.error('Error saving note:', error);
                alert('Failed to save note.');
            }
        };

        const deleteNote = async () => {
            if (!noteToDelete.value) return;

            try {
                const response = await fetch(`${API_URL}/${noteToDelete.value.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Failed to delete');

                await fetchNotes(); 
                showDeleteModal.value = false;
                noteToDelete.value = null;
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Failed to delete note.');
            }
        };

        const openCreateModal = () => {
            isEditing.value = false;
            form.value = { title: '', content: '' };
            currentId.value = null;
            showModal.value = true;
        };

        const openEditModal = (note) => {
            isEditing.value = true;
            form.value = { title: note.title, content: note.content };
            currentId.value = note.id;
            showModal.value = true;
        };

        const confirmDelete = (note) => {
            noteToDelete.value = note;
            showDeleteModal.value = true;
        };

        const closeModal = () => {
            showModal.value = false;
        };

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }).format(date);
        };

        onMounted(() => {
            fetchNotes();
            applyDarkMode();
        });

        return {
            notes,
            loading,
            showModal,
            showDeleteModal,
            isEditing,
            noteToDelete,
            form,
            darkMode, 
            toggleDarkMode, 
            fetchNotes,
            saveNote,
            deleteNote,
            openCreateModal,
            openEditModal,
            confirmDelete,
            closeModal,
            formatDate
        };
    }
}).mount('#app');
