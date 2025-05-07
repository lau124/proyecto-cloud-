// Elementos DOM
const loadingScreen = document.getElementById('loading-screen');
const locationsContainer = document.getElementById('locations-container');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const locationModal = document.getElementById('location-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

// Variables de estado
let locations = [];
let filteredLocations = [];
let currentPage = 1;
let totalPages = 1;
let currentFilter = 'all';
let searchTerm = '';

// URL de la API
const API_URL = 'https://rickandmortyapi.com/api';

// Inicializar la página
document.addEventListener('DOMContentLoaded', init);

// Función de inicialización
function init() {
    // Mostrar pantalla de carga
    loadingScreen.style.display = 'flex';
    
    // Cargar ubicaciones
    fetchLocations(1);
    
    // Event listeners
    retryBtn.addEventListener('click', () => fetchLocations(currentPage));
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            fetchLocations(1, searchTerm, currentFilter);
        });
    });
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchLocations(currentPage, searchTerm, currentFilter);
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchLocations(currentPage, searchTerm, currentFilter);
        }
    });
    
    closeModal.addEventListener('click', () => {
        locationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === locationModal) {
            locationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Función para obtener ubicaciones de la API
function fetchLocations(page = 1, name = '', type = '') {
    loadingScreen.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    // Construir URL con parámetros de búsqueda y filtro
    let url = `${API_URL}/location/?page=${page}`;
    
    if (name) {
        url += `&name=${name}`;
    }
    
    if (type && type !== 'all') {
        url += `&type=${type}`;
    }
    
    // Intentar obtener datos de la API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            return response.json();
        })
        .then(data => {
            locations = data.results;
            totalPages = data.info.pages;
            renderLocations();
            updatePagination();
            loadingScreen.style.display = 'none';
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
            loadingScreen.style.display = 'none';
            errorMessage.style.display = 'block';
        });
}

// Función para manejar la búsqueda
function handleSearch() {
    searchTerm = searchInput.value.trim().toLowerCase();
    currentPage = 1;
    fetchLocations(1, searchTerm, currentFilter !== 'all' ? currentFilter : '');
}

// Actualizar información de paginación
function updatePagination() {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Renderizar ubicaciones en la página
function renderLocations() {
    locationsContainer.innerHTML = '';
    
    // Si no hay ubicaciones que mostrar
    if (locations.length === 0) {
        locationsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #bdbdbd; margin-bottom: 1rem;"></i>
                <p>No se encontraron ubicaciones que coincidan con tu búsqueda.</p>
            </div>
        `;
        return;
    }
    
    // Crear tarjetas de ubicaciones
    locations.forEach(location => {
        const card = document.createElement('div');
        card.className = 'location-card fade-in';
        
        // Generar imagen aleatoria para la ubicación (ya que la API no proporciona imágenes de ubicaciones)
        const randomId = Math.floor(Math.random() * 20) + 1;
        const locationImage = `https://rickandmortyapi.com/api/character/avatar/${randomId}.jpeg`;
        
        card.innerHTML = `
            <img src="${locationImage}" alt="${location.name}" class="location-image" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/3.jpeg'">
            <div class="location-info">
                <h2 class="location-name">${location.name}</h2>
                <span class="location-type">${location.type}</span>
                <p class="location-dimension">Dimensión: ${location.dimension}</p>
                <p class="location-description">Residentes: ${location.residents.length}</p>
            </div>
        `;
        
        locationsContainer.appendChild(card);
        
        // Evento para abrir el modal con detalles de la ubicación
        card.addEventListener('click', () => {
            openLocationModal(location);
        });
    });
}

// Abrir modal con detalles de la ubicación
function openLocationModal(location) {
    // Obtener algunos residentes de la ubicación (limitado a 5 para no sobrecargar)
    const residentPromises = location.residents.slice(0, 5).map(url => 
        fetch(url).then(res => res.json())
    );
    
    Promise.all(residentPromises)
        .then(residents => {
            // Generar imagen aleatoria para la ubicación
            const randomId = Math.floor(Math.random() * 20) + 1;
            const locationImage = `https://rickandmortyapi.com/api/character/avatar/${randomId}.jpeg`;
            
            modalBody.innerHTML = `
                <div class="modal-location-header">
                    <img src="${locationImage}" alt="${location.name}" class="modal-location-image" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/3.jpeg'">
                    <div class="modal-location-title">
                        <h2>${location.name}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                            <span class="location-type">${location.type}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-location-stats">
                    <div class="stat-item">
                        <div class="stat-value">${location.dimension}</div>
                        <div class="stat-label">Dimensión</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${location.residents.length}</div>
                        <div class="stat-label">Residentes</div>
                    </div>
                </div>
                
                <div class="modal-location-residents">
                    <h3>Residentes Destacados</h3>
                    <div class="residents-list">
                        ${residents.map(resident => `
                            <div class="resident-item">
                                <img src="${resident.image}" alt="${resident.name}" style="width: 60px; height: 60px; border-radius: 50%; margin-right: 10px; float: left;" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/19.jpeg'">
                                <div class="resident-name">${resident.name}</div>
                                <div style="clear: both; margin-top: 10px;">
                                    <span class="character-status ${resident.status.toLowerCase() === 'alive' ? 'status-alive' : resident.status.toLowerCase() === 'dead' ? 'status-dead' : 'status-unknown'}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">${resident.status}</span>
                                    <span style="font-size: 0.8rem; color: #666;">${resident.species}</span>
                                </div>
                            </div>
                        `).join('')}
                        ${location.residents.length > 5 ? `<div class="resident-item" style="text-align: center; font-style: italic;">Y ${location.residents.length - 5} residentes más...</div>` : ''}
                    </div>
                </div>
            `;
            
            locationModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Error al cargar residentes:', error);
            
            // Mostrar modal sin residentes en caso de error
            const randomId = Math.floor(Math.random() * 20) + 1;
            const locationImage = `https://rickandmortyapi.com/api/character/avatar/${randomId}.jpeg`;
            
            modalBody.innerHTML = `
                <div class="modal-location-header">
                    <img src="${locationImage}" alt="${location.name}" class="modal-location-image" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/3.jpeg'">
                    <div class="modal-location-title">
                        <h2>${location.name}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                            <span class="location-type">${location.type}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-location-stats">
                    <div class="stat-item">
                        <div class="stat-value">${location.dimension}</div>
                        <div class="stat-label">Dimensión</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${location.residents.length}</div>
                        <div class="stat-label">Residentes</div>
                    </div>
                </div>
                
                <div class="modal-location-residents">
                    <h3>Residentes</h3>
                    <p>No se pudieron cargar los residentes.</p>
                </div>
            `;
            
            locationModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
}