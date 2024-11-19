// Variables globales pour recherche et filtres
let currentSearchTerm = '';
let currentMonthFilter = '';
let currentYearFilter = '';

// Chargement des factures depuis l'API
function loadFactures() {
    fetch('/api/factures')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau lors du chargement des données.');
            }
            return response.json();
        })
        .then(data => {
            displayFactures(data);
            setupSearchAndFilterEvents(data);
        })
        .catch(error => console.error('Erreur lors du chargement des factures :', error));
}

// Fonction pour afficher les factures
function displayFactures(factures) {
    const container = document.getElementById('factures-container');
    container.innerHTML = '';

    factures.forEach(facture => {
        const factureElement = document.createElement('div');
        factureElement.className = 'facture';

        factureElement.innerHTML = `
            <img src="${facture.image}" alt="Facture ${facture.name}" onerror="this.src='/images/default.png';">
            <p>${facture.name} - ${new Date(facture.date).toLocaleDateString()}</p>
            <div class="facture-actions">
                <button class="btn-modify" data-id="${facture._id}">Modifier</button>
                <button class="btn-delete" data-id="${facture._id}">Supprimer</button>
            </div>
        `;

        factureElement.querySelector('.btn-modify').addEventListener('click', () => openModifyPopup(facture));
        factureElement.querySelector('.btn-delete').addEventListener('click', () => deleteFacture(facture._id));

        container.appendChild(factureElement);
    });
}

// Fonction pour filtrer les factures
function filterFactures(factures) {
    const filtered = factures.filter(facture => {
        const matchesSearch = facture.name.toLowerCase().includes(currentSearchTerm);
        const matchesMonth = currentMonthFilter === '' || facture.date.split('-')[1] === currentMonthFilter;
        const matchesYear = currentYearFilter === '' || facture.date.split('-')[0] === currentYearFilter;
        return matchesSearch && matchesMonth && matchesYear;
    });

    displayFactures(filtered);
}

// Configuration des événements de recherche et filtre
function setupSearchAndFilterEvents(data) {
    const searchInput = document.getElementById('search');
    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase();
            filterFactures(data);
        });
    }

    if (monthFilter) {
        monthFilter.addEventListener('change', (e) => {
            currentMonthFilter = e.target.value;
            filterFactures(data);
        });
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            currentYearFilter = e.target.value;
            filterFactures(data);
        });
    }
}

// Gestion des pop-ups
function openAddFacturePopup() {
    document.getElementById('add-facture-popup').classList.add('show');
}

function closeAddFacturePopup() {
    document.getElementById('add-facture-popup').classList.remove('show');
}

function openModifyPopup(facture) {
    const modifyPopup = document.getElementById('modify-facture-popup');
    document.getElementById('modify-facture-name').value = facture.name;
    document.getElementById('modify-facture-date').value = facture.date;
    modifyPopup.dataset.id = facture._id;
    modifyPopup.classList.add('show');
}

function closeModifyPopup() {
    document.getElementById('modify-facture-popup').classList.remove('show');
}

// Ajouter une facture
document.getElementById('add-facture-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('facture-name').value.trim();
    const date = document.getElementById('facture-date').value;
    const imageInput = document.getElementById('facture-image');
    const image = imageInput.files[0];

    if (!image) {
        alert("Veuillez sélectionner une image pour la facture.");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('date', date);
    formData.append('image', image);

    try {
        const response = await fetch('/api/factures', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Erreur lors de l\'ajout de la facture.');
            return;
        }

        console.log('Facture ajoutée :', data);
        closeAddFacturePopup();
        loadFactures();
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la facture :', error);
    }
});

// Modifier une facture
document.getElementById('modify-facture-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const factureId = document.getElementById('modify-facture-popup').dataset.id;
    const name = document.getElementById('modify-facture-name').value.trim();
    const date = document.getElementById('modify-facture-date').value;
    const imageInput = document.getElementById('modify-facture-image').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('date', date);
    if (imageInput) {
        formData.append('image', imageInput);
    }

    try {
        const response = await fetch(`/api/factures/${factureId}`, {
            method: 'PUT',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Erreur lors de la modification de la facture.');
            return;
        }

        console.log('Facture modifiée :', data);
        closeModifyPopup();
        loadFactures();
    } catch (error) {
        console.error('Erreur lors de la modification de la facture :', error);
    }
});

// Supprimer une facture
function deleteFacture(factureId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
        fetch(`/api/factures/${factureId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                console.log('Facture supprimée :', data);
                loadFactures();
            })
            .catch(error => console.error('Erreur lors de la suppression de la facture :', error));
    }
}

// Initialisation des événements
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-facture-btn').addEventListener('click', openAddFacturePopup);
    loadFactures();
});
