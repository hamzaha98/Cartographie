document.addEventListener('DOMContentLoaded', function() {
    // Mobile filter toggle
    const mobileFilterToggle = document.querySelector('.mobile-filter-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    mobileFilterToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        this.textContent = sidebar.classList.contains('active') ? 
            'Filtres et Catégories ▲' : 'Filtres et Catégories ▼';
    });
    
    // View toggle functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            viewButtons.forEach(btn => btn.classList.add('inactive'));
            this.classList.remove('inactive');
            this.classList.add('active');
            
            console.log(`Switching to ${this.textContent} view`);
        });
    });
    
    // Category buttons functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log(`Category selected: ${this.textContent}`);
            // Pour mobile: fermer la sidebar après sélection
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
                mobileFilterToggle.textContent = 'Filtres et Catégories ▼';
            }
        });
    });
    
    // Filter buttons functionality
    document.querySelector('.apply-btn').addEventListener('click', function() {
        const location = document.querySelectorAll('.filter-input')[0].value;
        const keywords = document.querySelectorAll('.filter-input')[1].value;
        console.log(`Applying filters - Location: ${location}, Keywords: ${keywords}`);
        
        // Pour mobile: fermer la sidebar après application des filtres
        if (window.innerWidth < 768) {
            sidebar.classList.remove('active');
            mobileFilterToggle.textContent = 'Filtres et Catégories ▼';
        }
    });
    
    document.querySelector('.reset-btn').addEventListener('click', function() {
        document.querySelectorAll('.filter-input').forEach(input => {
            input.value = '';
        });
        console.log('Filters reset');
    });
    
    // Fix pour les tooltips sur mobile (tap instead of hover)
    if ('ontouchstart' in window) {
        const orgItems = document.querySelectorAll('.org-item');
        orgItems.forEach(item => {
            item.addEventListener('click', function(e) {
                const tooltip = this.querySelector('.org-tooltip');
                
                // Si le clic est sur un lien, permettre la navigation
                if (e.target.tagName === 'A') return;
                
                // Toggle tooltip
                if (tooltip.classList.contains('visible')) {
                    tooltip.classList.remove('visible');
                    tooltip.style.display = 'none';
                } else {
                    // Cacher tous les autres tooltips
                    document.querySelectorAll('.org-tooltip').forEach(t => {
                        t.classList.remove('visible');
                        t.style.display = 'none';
                    });
                    tooltip.classList.add('visible');
                    tooltip.style.display = 'block';
                    e.preventDefault();
                }
            });
        });
        
        // Fermer les tooltips quand on clique ailleurs
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.org-item')) {
                document.querySelectorAll('.org-tooltip').forEach(tooltip => {
                    tooltip.classList.remove('visible');
                    tooltip.style.display = 'none';
                });
            }
        });
    }
}); 