// Elementos DOM
const loadingScreen = document.getElementById('loading-screen');
const charactersContainer = document.getElementById('characters-container');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const characterModal = document.getElementById('character-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

// Variables de estado
let characters = [];
let filteredCharacters = [];
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
    
    // Cargar personajes
    fetchCharacters(1);
    
    // Event listeners
    retryBtn.addEventListener('click', () => fetchCharacters(currentPage));
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
            fetchCharacters(1, searchTerm, currentFilter);
        });
    });
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchCharacters(currentPage, searchTerm, currentFilter);
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchCharacters(currentPage, searchTerm, currentFilter);
        }
    });
    
    closeModal.addEventListener('click', () => {
        characterModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === characterModal) {
            characterModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Función para obtener personajes de la API
function fetchCharacters(page = 1, name = '', status = '') {
    loadingScreen.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    // Construir URL con parámetros de búsqueda y filtro
    let url = `${API_URL}/character/?page=${page}`;
    
    if (name) {
        url += `&name=${name}`;
    }
    
    if (status && status !== 'all') {
        url += `&status=${status}`;
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
            characters = data.results;
            totalPages = data.info.pages;
            renderCharacters();
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
    fetchCharacters(1, searchTerm, currentFilter !== 'all' ? currentFilter : '');
}

// Actualizar información de paginación
function updatePagination() {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Renderizar personajes en la página
function renderCharacters() {
    charactersContainer.innerHTML = '';
    
    // Si no hay personajes que mostrar
    if (characters.length === 0) {
        charactersContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #bdbdbd; margin-bottom: 1rem;"></i>
                <p>No se encontraron personajes que coincidan con tu búsqueda.</p>
            </div>
        `;
        return;
    }
    
    // Crear tarjetas de personajes
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card fade-in';
        
        // Determinar clase de estado
        let statusClass = 'status-unknown';
        if (character.status.toLowerCase() === 'alive') {
            statusClass = 'status-alive';
        } else if (character.status.toLowerCase() === 'dead') {
            statusClass = 'status-dead';
        }
        
        card.innerHTML = `
            <img src="${character.image}" alt="${character.name}" class="character-image" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/19.jpeg'">
            <div class="character-info">
                <h2 class="character-name">${character.name}</h2>
                <span class="character-status ${statusClass}">${character.status}</span>
                <span class="character-species">${character.species}</span>
                <p class="character-location">Última ubicación: ${character.location.name}</p>
            </div>
        `;
        
        charactersContainer.appendChild(card);
        
        // Evento para abrir el modal con detalles del personaje
        card.addEventListener('click', () => {
            openCharacterModal(character);
        });
    });
}

// Abrir modal con detalles del personaje
function openCharacterModal(character) {
    // Obtener episodios del personaje
    const episodePromises = character.episode.slice(0, 5).map(url => 
        fetch(url).then(res => res.json())
    );
    
    Promise.all(episodePromises)
        .then(episodes => {
            modalBody.innerHTML = `
                <div class="modal-character-header">
                    <img src="${character.image}" alt="${character.name}" class="modal-character-image" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/19.jpeg'">
                    <div class="modal-character-title">
                        <h2>${character.name}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                            <span class="character-status ${character.status.toLowerCase() === 'alive' ? 'status-alive' : character.status.toLowerCase() === 'dead' ? 'status-dead' : 'status-unknown'}">${character.status}</span>
                            <span class="character-species">${character.species}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-character-stats">
                    <div class="stat-item">
                        <div class="stat-value">${character.gender}</div>
                        <div class="stat-label">Género</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${character.origin.name}</div>
                        <div class="stat-label">Origen</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${character.location.name}</div>
                        <div class="stat-label">Ubicación</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${character.episode.length}</div>
                        <div class="stat-label">Episodios</div>
                    </div>
                </div>
                
                <div class="modal-character-episodes">
                    <h3>Apariciones Recientes</h3>
                    <div class="episodes-list">
                        ${episodes.map(episode => `
                            <div class="episode-item">
                                <div class="episode-name">${episode.name}</div>
                                <div class="episode-info">${episode.episode}</div>
                                <div class="episode-air-date">Emisión: ${episode.air_date}</div>
                            </div>
                        `).join('')}
                        ${character.episode.length > 5 ? `<div class="episode-item" style="text-align: center; font-style: italic;">Y ${character.episode.length - 5} episodios más...</div>` : ''}
                    </div>
                </div>
            `;
            
            characterModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Error al cargar episodios:', error);
            
            // Mostrar modal sin episodios en caso de error
            modalBody.innerHTML = `
                <div class="modal-character-header">
                    <img src="${character.image}" alt="${character.name}" class="modal-character-image" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/19.jpeg'">
                    <div class="modal-character-title">
                        <h2>${character.name}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                            <span class="character-status ${character.status.toLowerCase() === 'alive' ? 'status-alive' : character.status.toLowerCase() === 'dead' ? 'status-dead' : 'status-unknown'}">${character.status}</span>
                            <span class="character-species">${character.species}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-character-stats">
                    <div class="stat-item">
                        <div class="stat-value">${character.gender}</div>
                        <div class="stat-label">Género</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${character.origin.name}</div>
                        <div class="stat-label">Origen</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${character.location.name}</div>
                        <div class="stat-label">Ubicación</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${character.episode.length}</div>
                        <div class="stat-label">Episodios</div>
                    </div>
                </div>
                
                <div class="modal-character-episodes">
                    <h3>Apariciones</h3>
                    <p>No se pudieron cargar los episodios.</p>
                </div>
            `;
            
            characterModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
}