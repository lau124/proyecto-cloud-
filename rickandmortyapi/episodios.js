// Elementos DOM
const loadingScreen = document.getElementById('loading-screen');
const episodesContainer = document.getElementById('episodes-container');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const episodeModal = document.getElementById('episode-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

// Variables de estado
let episodes = [];
let filteredEpisodes = [];
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
    
    // Cargar episodios
    fetchEpisodes(1);
    
    // Event listeners
    retryBtn.addEventListener('click', () => fetchEpisodes(currentPage));
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
            fetchEpisodes(1, searchTerm, currentFilter);
        });
    });
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchEpisodes(currentPage, searchTerm, currentFilter);
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchEpisodes(currentPage, searchTerm, currentFilter);
        }
    });
    
    closeModal.addEventListener('click', () => {
        episodeModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === episodeModal) {
            episodeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Función para obtener episodios de la API
function fetchEpisodes(page = 1, name = '', episode = '') {
    loadingScreen.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    // Construir URL con parámetros de búsqueda y filtro
    let url = `${API_URL}/episode/?page=${page}`;
    
    if (name) {
        url += `&name=${name}`;
    }
    
    if (episode && episode !== 'all') {
        url += `&episode=${episode}`;
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
            episodes = data.results;
            totalPages = data.info.pages;
            renderEpisodes();
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
    fetchEpisodes(1, searchTerm, currentFilter !== 'all' ? currentFilter : '');
}

// Actualizar información de paginación
function updatePagination() {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Renderizar episodios en la página
function renderEpisodes() {
    episodesContainer.innerHTML = '';
    
    // Si no hay episodios que mostrar
    if (episodes.length === 0) {
        episodesContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #bdbdbd; margin-bottom: 1rem;"></i>
                <p>No se encontraron episodios que coincidan con tu búsqueda.</p>
            </div>
        `;
        return;
    }
    
    // Crear tarjetas de episodios
    episodes.forEach(episode => {
        const card = document.createElement('div');
        card.className = 'episode-card fade-in';
        
        // Obtener temporada y número de episodio
        const [, season, episodeNum] = episode.episode.match(/S(\d+)E(\d+)/);
        
        // Generar imagen aleatoria para el episodio (ya que la API no proporciona imágenes de episodios)
        const randomCharId = Math.floor(Math.random() * 20) + 1;
        const episodeImage = `https://rickandmortyapi.com/api/character/avatar/${randomCharId}.jpeg`;
        
        card.innerHTML = `
            <img src="${episodeImage}" alt="${episode.name}" class="character-image" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/1.jpeg'">
            <div class="episode-info">
                <h2 class="episode-title">${episode.name}</h2>
                <span class="episode-number">Temporada ${parseInt(season)} - Episodio ${parseInt(episodeNum)}</span>
                <p class="episode-air-date">Fecha de emisión: ${episode.air_date}</p>
                <p class="episode-description">Personajes: ${episode.characters.length}</p>
            </div>
        `;
        
        episodesContainer.appendChild(card);
        
        // Evento para abrir el modal con detalles del episodio
        card.addEventListener('click', () => {
            openEpisodeModal(episode);
        });
    });
}

// Abrir modal con detalles del episodio
function openEpisodeModal(episode) {
    // Obtener algunos personajes del episodio (limitado a 5 para no sobrecargar)
    const characterPromises = episode.characters.slice(0, 5).map(url => 
        fetch(url).then(res => res.json())
    );
    
    Promise.all(characterPromises)
        .then(characters => {
            // Obtener temporada y número de episodio
            const [, season, episodeNum] = episode.episode.match(/S(\d+)E(\d+)/);
            
            // Generar imagen aleatoria para el episodio
            const randomCharId = Math.floor(Math.random() * 20) + 1;
            const episodeImage = `https://rickandmortyapi.com/api/character/avatar/${randomCharId}.jpeg`;
            
            modalBody.innerHTML = `
                <div class="modal-episode-header">
                    <img src="${episodeImage}" alt="${episode.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px 10px 0 0;" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/1.jpeg'">
                    <div class="modal-episode-title" style="padding: 1.5rem;">
                        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${episode.name}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                            <span class="episode-number">Temporada ${parseInt(season)} - Episodio ${parseInt(episodeNum)}</span>
                            <span style="background-color: var(--secondary-color); color: white; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600;">${episode.episode}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-episode-content" style="padding: 0 1.5rem 1.5rem;">
                    <div class="modal-episode-description" style="margin-bottom: 2rem; line-height: 1.8;">
                        <p style="font-size: 1.1rem; margin-bottom: 1rem;">Fecha de emisión: <strong>${episode.air_date}</strong></p>
                        <p>Este episodio cuenta con la participación de ${episode.characters.length} personajes.</p>
                    </div>
                    
                    <div class="modal-episode-characters">
                        <h3 style="margin-bottom: 1rem; font-size: 1.5rem; color: var(--dark-color); border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem;">Personajes Destacados</h3>
                        <div class="characters-list">
                            ${characters.map(character => `
                                <div class="character-item">
                                    <img src="${character.image}" alt="${character.name}" style="width: 60px; height: 60px; border-radius: 50%; margin-right: 10px; float: left;" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/19.jpeg'">
                                    <div class="character-name-small">${character.name}</div>
                                    <div style="clear: both; margin-top: 10px;">
                                        <span class="character-status ${character.status.toLowerCase() === 'alive' ? 'status-alive' : character.status.toLowerCase() === 'dead' ? 'status-dead' : 'status-unknown'}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">${character.status}</span>
                                        <span style="font-size: 0.8rem; color: #666;">${character.species}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${episode.characters.length > 5 ? `<div class="character-item" style="text-align: center; font-style: italic;">Y ${episode.characters.length - 5} personajes más...</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            episodeModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Error al cargar personajes:', error);
            
            // Mostrar modal sin personajes en caso de error
            const [, season, episodeNum] = episode.episode.match(/S(\d+)E(\d+)/);
            const randomCharId = Math.floor(Math.random() * 20) + 1;
            const episodeImage = `https://rickandmortyapi.com/api/character/avatar/${randomCharId}.jpeg`;
            
            modalBody.innerHTML = `
                <div class="modal-episode-header">
                    <img src="${episodeImage}" alt="${episode.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px 10px 0 0;" onerror="this.src='https://rickandmortyapi.com/api/character/avatar/1.jpeg'">
                    <div class="modal-episode-title" style="padding: 1.5rem;">
                        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${episode.name}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                            <span class="episode-number">Temporada ${parseInt(season)} - Episodio ${parseInt(episodeNum)}</span>
                            <span style="background-color: var(--secondary-color); color: white; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600;">${episode.episode}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-episode-content" style="padding: 0 1.5rem 1.5rem;">
                    <div class="modal-episode-description" style="margin-bottom: 2rem; line-height: 1.8;">
                        <p style="font-size: 1.1rem; margin-bottom: 1rem;">Fecha de emisión: <strong>${episode.air_date}</strong></p>
                        <p>Este episodio cuenta con la participación de ${episode.characters.length} personajes.</p>
                    </div>
                    
                    <div class="modal-episode-characters">
                        <h3 style="margin-bottom: 1rem; font-size: 1.5rem; color: var(--dark-color); border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem;">Personajes</h3>
                        <p>No se pudieron cargar los personajes.</p>
                    </div>
                </div>
            `;
            
            episodeModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
}