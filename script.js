document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('curtainVideo');
    const followupVideo = document.getElementById('followupVideo');
    const transitionFrame = document.getElementById('transitionFrame');
    const followupContent = document.getElementById('followupContent');
    const pageDivider = document.querySelector('.page-divider');
    const playOverlay = document.getElementById('playOverlay');
    const textOverlay = document.getElementById('textOverlay');
    const music = document.getElementById('bgMusic');

   

    if (music) {
        music.volume = 0.3;
    }

    playOverlay.addEventListener('click', async () => {
        const poster = document.getElementById('videoPoster');
        if (poster) {
            poster.style.opacity = '0';
            poster.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                poster.style.display = 'none';
            }, 500);
        }

        playOverlay.style.opacity = '0';
        playOverlay.style.pointerEvents = 'none';

        setTimeout(() => {
            playOverlay.style.display = 'none';
        }, 500);

        try {
            await video.play();
        } catch (error) {
            console.error(error);
        }

        if (music) {
            startMusic();
        }
    });

    let transitionFrameCaptured = false;
    const captureTransitionFrame = () => {
        if (!video.videoWidth || !video.videoHeight) {
            return false;
        }

        transitionFrame.width = video.videoWidth;
        transitionFrame.height = video.videoHeight;
        const context = transitionFrame.getContext('2d');
        context.drawImage(video, 0, 0, transitionFrame.width, transitionFrame.height);
        return true;
    };

    video.addEventListener('timeupdate', () => {
        if (video.currentTime > 0.5) {
            if (textOverlay && !textOverlay.classList.contains('reveal')) {
                textOverlay.classList.add('reveal');
            }
        }

        if (video.duration - video.currentTime < 0.5) {
            transitionFrameCaptured = captureTransitionFrame() || transitionFrameCaptured;
        }
    });

    video.addEventListener('ended', async () => {
        const heroSection = document.querySelector('.hero-section');

        if (pageDivider) {
            pageDivider.classList.add('is-visible');
            pageDivider.setAttribute('aria-hidden', 'false');
        }

        if (!transitionFrameCaptured) {
            transitionFrameCaptured = captureTransitionFrame();
        }
        if (transitionFrameCaptured) {
            transitionFrame.classList.add('is-visible');
        }

        if (heroSection) {
            heroSection.style.position = 'relative';
        }
        document.body.style.overflow = 'auto';

        try {
            await followupVideo.play();
            await new Promise(resolve => {
                if (typeof followupVideo.requestVideoFrameCallback === 'function') {
                    followupVideo.requestVideoFrameCallback(resolve);
                } else {
                    requestAnimationFrame(() => requestAnimationFrame(resolve));
                }
            });
            followupVideo.classList.add('is-visible');
            video.classList.add('is-hidden');
            setTimeout(() => transitionFrame.classList.remove('is-visible'), 250);
        } catch (error) {
            console.error(error);
        }
    });

    followupVideo.addEventListener('timeupdate', () => {
        if (followupVideo.currentTime >= 0.8 && !followupContent.classList.contains('is-visible')) {
            followupContent.classList.add('is-visible');
            followupContent.setAttribute('aria-hidden', 'false');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.15
    });

    const scrollElements = document.querySelectorAll('.scroll-animate, .stagger-anim');
    scrollElements.forEach(el => observer.observe(el));

    setupScratchCards();
    setupCountdown();
    setupRsvp();
});

function setupRsvp() {
    const form = document.getElementById('rsvpForm');
    const guestCount = document.getElementById('guestCount');
    const guestField = document.getElementById('rsvpGuests');
    const message = document.getElementById('rsvpMessage');

    form.addEventListener('change', event => {
        if (event.target.name !== 'attendance') {
            return;
        }

        const isAttending = event.target.value === 'yes';
        guestField.hidden = !isAttending;
        guestCount.disabled = !isAttending;
        guestCount.required = isAttending;

        if (!isAttending) {
            guestCount.value = '';
        }

        form.querySelectorAll('.rsvp-choice').forEach(choice => {
            choice.classList.toggle('is-selected', choice.querySelector('input').checked);
        });
    });

    form.addEventListener('submit', event => {
        event.preventDefault();

        const formData = new FormData(form);
        const name = String(formData.get('name')).trim();
        const attendance = formData.get('attendance');

        if (attendance === 'yes') {
            const count = formData.get('guestCount');
            message.textContent = `Thank you, ${name}! We look forward to celebrating with your party of ${count}.`;
        } else {
            message.textContent = `Thank you for letting us know, ${name}. You’ll be in our thoughts on our special day.`;
        }

        message.classList.add('is-visible');
    });
}

function setupScratchCards() {
    const canvases = document.querySelectorAll('.scratch-canvas');
    let completedCount = 0;
    let videoPlayed = false;

    function playScratchVideo() {
        if (!videoPlayed) {
            const scratchVid = document.getElementById('scratchVideo');
            if (scratchVid) {
                scratchVid.play().catch(e => console.log('Video play failed', e));
                videoPlayed = true;
            }
        }
    }

    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let isDrawing = false;
        let isCompleted = false;

       
      // Fill gold conic gradient for realistic metallic look
const cx = canvas.width / 2;
const cy = canvas.height / 2;

let gradient;

if (ctx.createConicGradient) {
    gradient = ctx.createConicGradient(0, cx, cy);

    // Gold and Burgundy flower color metallic mix gradient
    gradient.addColorStop(0, "#610B14");
    gradient.addColorStop(0.15, "#efe3cf");
    gradient.addColorStop(0.3, "#b49a72");
    gradient.addColorStop(0.5, "#610B14");
    gradient.addColorStop(0.65, "#fff5df");
    gradient.addColorStop(0.8, "#d2c1a5");
    gradient.addColorStop(1, "#610B14");
} else {
    gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, cx);

    gradient.addColorStop(0, "#efe3cf");
    gradient.addColorStop(0.5, "#b49a72");
    gradient.addColorStop(1, "#610B14");
}

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Add slight texture
ctx.fillStyle = "rgba(255,255,255,0.05)";
for (let i = 0; i < 400; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
}

ctx.globalCompositeOperation = 'destination-out';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 18;

        ctx.globalCompositeOperation = 'destination-out';

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            let clientX = e.clientX;
            let clientY = e.clientY;
            
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            }
            
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

       function scratch(e) {
    if (!isDrawing || isCompleted) return;
    e.preventDefault();

    const pos = getMousePos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;

    checkCompletion();
}

        canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    playScratchVideo();
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener('mousemove', scratch);

window.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    playScratchVideo();
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
}, { passive: false });

canvas.addEventListener('touchmove', scratch, { passive: false });

window.addEventListener('touchend', () => {
    isDrawing = false;
});

        function checkCompletion() {
            if (isCompleted) return;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let transparentPixels = 0;
            const totalPixels = imageData.data.length / 4;
            
            // Checking every 4th pixel for speed optimization
            for (let i = 3; i < imageData.data.length; i += 16) {
                // Some mobile GPUs leave alpha at 1-30 instead of 0 after destination-out, 
                // so we check if the pixel is mostly transparent!
                if (imageData.data[i] < 50) { 
                    transparentPixels++;
                }
            }
            
            const transparentRatio = transparentPixels / (totalPixels / 4);
            if (transparentRatio > 0.05) { // 5% scratched threshold for instant completion
                isCompleted = true;
                
                canvas.style.transition = 'opacity 0.3s ease';
                canvas.style.opacity = '0';
                
                const base = canvas.parentElement.querySelector('.scratch-base');
                if(base) base.classList.add('scratched-pop');
                
                setTimeout(() => canvas.style.display = 'none', 300);

                completedCount++;
                if (completedCount === 3) {
                    onAllScratched();
                }
            }
        }
    });

    function onAllScratched() {
        const butterfly = document.querySelector('.scratch-butterfly');

if (butterfly) {
    butterfly.classList.add('show');
}
        const scratchContainer = document.querySelector('.scratch-container');
        let originY = 0.5;
        let originX = 0.5;
        
        if (scratchContainer) {
            const rect = scratchContainer.getBoundingClientRect();
            originY = (rect.top + rect.height / 2) / window.innerHeight;
            originX = (rect.left + rect.width / 2) / window.innerWidth;
        }

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { x: originX, y: originY },
                colors: ['#610B14', '#610B14', '#F7F0E3', '#A68B5B'],
                shapes: ['circle', 'square'],
                scalar: 1.2,
                zIndex: 9999,
                drift: 0,
                ticks: 200
            });
        }

        // Reveal the hidden countdown
        const hiddenCountdown = document.getElementById('hiddenCountdown');

if (hiddenCountdown) {
    hiddenCountdown.classList.add('show');

    setTimeout(() => {
        hiddenCountdown.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 300);
}; // Wait for the popper peak before sliding down
    }
}

function setupCountdown() {
    // Wedding date
    const countdownDate = new Date("November 08, 2026 11:30:00").getTime();
    
    const dEl = document.getElementById("days");
    const hEl = document.getElementById("hours");
    const mEl = document.getElementById("minutes");
    const sEl = document.getElementById("seconds");

    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = countdownDate - now;
        
        if (distance < 0) {
            clearInterval(timer);
            return;
        }

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        days = days < 10 ? '0' + days : days;
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        if(dEl) dEl.innerHTML = days;
        if(hEl) hEl.innerHTML = hours;
        if(mEl) mEl.innerHTML = minutes;
        if(sEl) sEl.innerHTML = seconds;
    }, 1000);
}



// ❤️ HEART TRAIL EFFECT
document.addEventListener('touchstart', createHeart);
document.addEventListener('mousemove', createHeart);

function createHeart(e) {
    let x, y;

    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    const heart = document.createElement("div");
    heart.className = "heart";

    heart.style.left = x + "px";
    heart.style.top = y + "px";

    document.body.appendChild(heart);

    // remove after animation
    setTimeout(() => {
        heart.remove();
    }, 1000);
}


const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');

let isPlaying = false;
let shouldResumeAfterFocus = false;

function setMusicButtonIcon(playing) {
    if (musicIcon) {
        musicIcon.setAttribute('icon', playing ? 'lucide:volume-2' : 'lucide:volume-x');
    }
}

function startMusic() {
    if (!music) return;

    if (!music.paused) {
        isPlaying = true;
        setMusicButtonIcon(true);
        return;
    }

    music.play().then(() => {
        isPlaying = true;
        setMusicButtonIcon(true);
    }).catch(() => {
        isPlaying = false;
        setMusicButtonIcon(false);
    });
    
}

function pauseMusic() {
    if (!music || music.paused) return;

    music.pause();
    isPlaying = false;
}

function handleVisibilityChange() {
    if (document.hidden) {
        if (music && !music.paused && isPlaying) {
            pauseMusic();
            shouldResumeAfterFocus = true;
        }
    } else if (shouldResumeAfterFocus) {
        shouldResumeAfterFocus = false;
        startMusic();
    }
}

// toggle button
if (music && musicToggle && musicIcon) {
    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            pauseMusic();
            setMusicButtonIcon(false);
        } else {
            startMusic();
        }
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    window.addEventListener('blur', () => {
        if (music && !music.paused && isPlaying) {
            pauseMusic();
            shouldResumeAfterFocus = true;
        }
    });

    window.addEventListener('focus', () => {
        if (!document.hidden && shouldResumeAfterFocus) {
            shouldResumeAfterFocus = false;
            startMusic();
        }
    });
}
