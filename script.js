(function(){
	'use strict';

	// Theme toggle with persistence
	const root = document.documentElement;
	const themeToggle = document.getElementById('themeToggle');
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme === 'light') root.setAttribute('data-theme', 'light');
	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			const isLight = root.getAttribute('data-theme') === 'light';
			if (isLight) {
				root.removeAttribute('data-theme');
				localStorage.setItem('theme', 'dark');
			} else {
				root.setAttribute('data-theme', 'light');
				localStorage.setItem('theme', 'light');
			}
		});
	}

	// Dynamic year
	document.getElementById('year').textContent = new Date().getFullYear();

	// Filters for projects
	const filters = Array.from(document.querySelectorAll('.filter'));
	const projectCards = Array.from(document.querySelectorAll('.project-card'));
	function applyFilter(category){
		projectCards.forEach(card => {
			const match = category === 'all' || card.dataset.category === category;
			card.style.display = match ? '' : 'none';
		});
	}
	filters.forEach(btn => {
		btn.addEventListener('click', () => {
			filters.forEach(b => b.classList.remove('is-active'));
			btn.classList.add('is-active');
			applyFilter(btn.dataset.filter);
		});
	});

	// Modal for project details
	const modal = document.getElementById('projectModal');
	const modalTitle = document.getElementById('modalTitle');
	const modalDescription = document.getElementById('modalDescription');
	const modalMedia = document.getElementById('modalMedia');
	const modalPrimary = document.getElementById('modalPrimary');
	function openModal({ title, description, image, href }){
		modalTitle.textContent = title || 'Projet';
		modalDescription.textContent = description || '';
		modalMedia.innerHTML = '';
		if (image) {
			const img = document.createElement('img');
			img.src = image; img.alt = title;
			modalMedia.appendChild(img);
		}
		if (href) {
			modalPrimary.href = href;
			modalPrimary.removeAttribute('hidden');
		} else {
			modalPrimary.setAttribute('hidden', '');
		}
		modal.setAttribute('aria-hidden', 'false');
		modal.setAttribute('aria-modal', 'true');
		document.body.style.overflow = 'hidden';
	}
	function closeModal(){
		modal.setAttribute('aria-hidden', 'true');
		modal.setAttribute('aria-modal', 'false');
		document.body.style.overflow = '';
	}
	modal?.addEventListener('click', (e) => {
		const target = e.target;
		if (target.hasAttribute('data-close')) closeModal();
	});
	document.querySelector('.modal-close')?.addEventListener('click', closeModal);
	projectCards.forEach(card => {
		card.addEventListener('click', () => {
			openModal({
				title: card.dataset.title,
				description: card.dataset.description,
				image: card.dataset.image,
				href: '#'
			});
		});
	});

	// Contact form validation + toast
	const form = document.getElementById('contactForm');
	const toast = document.getElementById('toast');
	function showToast(message){
		toast.textContent = message;
		toast.hidden = false;
		setTimeout(() => { toast.hidden = true; }, 2500);
	}
	form?.addEventListener('submit', (e) => {
		e.preventDefault();
		const formData = new FormData(form);
		const name = String(formData.get('name') || '').trim();
		const email = String(formData.get('email') || '').trim();
		const message = String(formData.get('message') || '').trim();
		const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		if (!name || !email || !message || !emailOk) {
			showToast('Veuillez remplir correctement le formulaire.');
			return;
		}
		showToast('Message envoyé ! Merci.');
		form.reset();
	});

	// Reveal on scroll
	const revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));
	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) entry.target.classList.add('is-visible');
		});
	},{ threshold: 0.12 });
	revealNodes.forEach(n => observer.observe(n));
})();