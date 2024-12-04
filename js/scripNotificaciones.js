const form = document.getElementById('myform');
console.log(form);
const message = document.querySelector('#message');

form.addEventListener('submit', e => { 
    e.preventDefault();
    fetch('https://backend-pwa-3o91.onrender.com/new-message', {
        method: 'POST',
        body: JSON.stringify({
            message: message.value
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    form.reset();
})

