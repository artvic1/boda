document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos
    const sections = document.querySelectorAll('.section');
    const navDots = document.querySelectorAll('.nav-dot');
    const audio = document.getElementById('background-music');
    const playButton = document.getElementById('play-button');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeElement = document.getElementById('current-time');
    const durationElement = document.getElementById('duration');
    const rsvpForm = document.getElementById('rsvp-form');
    const thankYouMessage = document.getElementById('thank-you');
    
    // Variables para la cuenta regresiva
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    // Fecha objetivo para la cuenta regresiva (27 de septiembre de 2025)
    const targetDate = new Date('2025-09-27T20:00:00').getTime();

    // Variables para el reproductor de audio
    let isPlaying = false;
    let raf = null;

    // 🔊 Reproducción automática del audio (en silencio inicialmente)
    if (audio) {
        audio.autoplay = true;
        audio.muted = true; 
        audio.loop = true;
        
        // Intentar reproducir
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Reproducción automática bloqueada. Esperando interacción del usuario.");
            });
        }

        // Activar sonido cuando el usuario haga clic en cualquier parte
        document.addEventListener('click', function() {
            audio.muted = false;
        }, { once: true });
    }

    // Función para actualizar la cuenta regresiva
    function updateCountdown() {
        if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return;
        
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference <= 0) {
            daysElement.textContent = '0';
            hoursElement.textContent = '0';
            minutesElement.textContent = '0';
            secondsElement.textContent = '0';
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        daysElement.textContent = days;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
        secondsElement.textContent = seconds;
    }
    
    // Iniciar la cuenta regresiva
    if (daysElement && hoursElement && minutesElement && secondsElement) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Formatear el tiempo (mm:ss)
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Función para actualizar el tiempo del reproductor
    function updatePlayerTime() {
        if (!audio || !seekSlider || !currentTimeElement) return;
        
        seekSlider.value = audio.currentTime;
        currentTimeElement.textContent = formatTime(audio.currentTime);
        
        if (isPlaying) {
            raf = requestAnimationFrame(updatePlayerTime);
        }
    }

    // Configuración del reproductor de audio
    if (audio && seekSlider && currentTimeElement && durationElement && playButton) {
        audio.addEventListener('loadedmetadata', function() {
            seekSlider.max = audio.duration;
            durationElement.textContent = formatTime(audio.duration);
        });

        if (audio.readyState >= 2) {
            seekSlider.max = audio.duration;
            durationElement.textContent = formatTime(audio.duration);
        }

        playButton.addEventListener('click', function() {
            if (isPlaying) {
                audio.pause();
                playButton.innerHTML = '<i class="ri-play-fill"></i>';
                cancelAnimationFrame(raf);
            } else {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        playButton.innerHTML = '<i class="ri-pause-fill"></i>';
                        raf = requestAnimationFrame(updatePlayerTime);
                    }).catch(error => {
                        console.error("Error reproduciendo audio:", error);
                        isPlaying = false;
                    });
                }
            }
            isPlaying = !isPlaying;
        });

        seekSlider.addEventListener('input', function() {
            cancelAnimationFrame(raf);
            audio.currentTime = seekSlider.value;
        });

        seekSlider.addEventListener('change', function() {
            if (isPlaying) {
                raf = requestAnimationFrame(updatePlayerTime);
            }
        });

        audio.addEventListener('waiting', function() {
            console.log('Audio está cargando...');
        });

        audio.addEventListener('error', function(e) {
            console.error('Error de audio:', e);
        });
    }

    // Navegación con los puntos de la página
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            sections[index].scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Actualizar punto activo al hacer scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navDots.forEach(dot => dot.classList.remove('active'));
                if (navDots[index]) {
                    navDots[index].classList.add('active');
                }
            }
        });
    });

    // Manejar el envío del formulario RSVP
    if (rsvpForm && thankYouMessage) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const attendance = document.querySelector('input[name="attendance"]:checked').value;
            
            // Crear mensaje según la respuesta (asistencia o no asistencia)
            let message = '';
            if (attendance === 'yes') {
                message = encodeURIComponent(
                    `¡Hola! Soy ${name} y confirmo mi asistencia a la boda de Juana y Victor. ¡Nos vemos allí!`
                );
            } else {
                message = encodeURIComponent(
                    `¡Hola! Soy ${name} y lamentablemente no podré asistir a la boda de Juana y Victor. Les deseo muchas felicidades.`
                );
            }
            
            // Abrir WhatsApp con el mensaje correspondiente
            window.open(`https://wa.me/+573014287828?text=${message}`, '_blank');
            
            // Mostrar mensaje de agradecimiento
            rsvpForm.classList.add('hidden');
            thankYouMessage.classList.remove('hidden');
        });
    }
});


document.addEventListener('click', function() {
    const audio = document.getElementById('background-music');
    if (audio) {
        audio.muted = false; // Activar el audio al hacer clic
    }
}, { once: true }); // Solo se ejecuta una vez