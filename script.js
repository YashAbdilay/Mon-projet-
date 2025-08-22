(function(){
	'use strict';

	const root = document.documentElement;
	const app = document.querySelector('.app');

	// Theme toggle with persistence + system default fallback
	const themeToggle = document.getElementById('themeToggle');
	const savedTheme = localStorage.getItem('theme');
	if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
		root.setAttribute('data-theme', 'light');
	}
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

	// Sidebar toggle (mobile)
	const sidebarToggle = document.getElementById('sidebarToggle');
	sidebarToggle?.addEventListener('click', () => {
		app?.classList.toggle('sidebar-open');
	});
	// Close sidebar by clicking backdrop
	if (app) {
		app.addEventListener('click', (e) => {
			if (!app.classList.contains('sidebar-open')) return;
			const sidebar = document.querySelector('.sidebar');
			if (sidebar && !sidebar.contains(e.target)) app.classList.remove('sidebar-open');
		});
	}

	// Admin avatar upload + persistence
	const avatarInput = document.getElementById('avatarInput');
	const adminAvatar = document.getElementById('adminAvatar');
	const resetAvatar = document.getElementById('resetAvatar');
	const AVATAR_KEY = 'admin-avatar';
	function applyAvatar(dataUrl){
		if (!adminAvatar) return;
		if (dataUrl) {
			adminAvatar.style.backgroundImage = `url(${dataUrl})`;
			adminAvatar.classList.add('has-image');
			const labelSpan = adminAvatar.querySelector('span');
			if (labelSpan) labelSpan.style.display = 'none';
		} else {
			adminAvatar.style.backgroundImage = '';
			adminAvatar.classList.remove('has-image');
			const labelSpan = adminAvatar.querySelector('span');
			if (labelSpan) labelSpan.style.display = '';
		}
	}
	applyAvatar(localStorage.getItem(AVATAR_KEY));
	avatarInput?.addEventListener('change', async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = String(reader.result || '');
			localStorage.setItem(AVATAR_KEY, dataUrl);
			applyAvatar(dataUrl);
		};
		reader.readAsDataURL(file);
	});
	resetAvatar?.addEventListener('click', () => {
		localStorage.removeItem(AVATAR_KEY);
		applyAvatar('');
	});

	// Active nav highlighting based on path
	const navMap = {
		'': 'home',
		'index.html': 'home',
		'equipe.html': 'equipe',
		'projets.html': 'projets',
		'competences.html': 'competences',
		'contact.html': 'contact'
	};
	const current = (location.pathname.split('/').pop() || '').toLowerCase();
	const activeKey = navMap[current] || 'home';
	const navLinks = document.querySelectorAll('.nav-btn');
	navLinks.forEach(l => l.classList.remove('is-active'));
	document.querySelector(`.nav-btn[data-nav="${activeKey}"]`)?.classList.add('is-active');

	// Dynamic year (if present)
	document.getElementById('year')?.textContent = new Date().getFullYear();

	// Home clock with subtle tick animation
	const clock = document.getElementById('clock');
	function pad(n){ return String(n).padStart(2, '0'); }
	function renderClock(){
		const now = new Date();
		const h = pad(now.getHours());
		const m = pad(now.getMinutes());
		const s = pad(now.getSeconds());
		const next = `${h}:${m}:${s}`;
		if (clock && clock.textContent !== next) {
			clock.textContent = next;
			clock.classList.remove('tick');
			// reflow to restart animation
			void clock.offsetWidth;
			clock.classList.add('tick');
		}
	}
	if (clock) {
		renderClock();
		setInterval(renderClock, 1000);
	}

	// Filters for projects (on projets.html)
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
		if (!modal) return;
		modalTitle.textContent = title || 'Projet';
		modalDescription.textContent = description || '';
		modalMedia.innerHTML = '';
		if (image) {
			const img = document.createElement('img');
			img.src = image; img.alt = title || '';
			modalMedia.appendChild(img);
		}
		if (href) {
			modalPrimary.href = href;
			modalPrimary.removeAttribute('hidden');
		} else {
			modalPrimary?.setAttribute('hidden', '');
		}
		modal.setAttribute('aria-hidden', 'false');
		modal.setAttribute('aria-modal', 'true');
		document.body.style.overflow = 'hidden';
	}
	function closeModal(){
		if (!modal) return;
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
		if (!toast) return alert(message);
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