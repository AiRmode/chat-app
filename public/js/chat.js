const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const contentHeight = $messages.scrollHeight;

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    //disable a form
    $messageFormButton.setAttribute('disabled', 'disabled');

    const textMessage = event.target.elements.message.value;
    socket.emit('sendMessage', textMessage, (error) => {
        //enable a form
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('Message delivered');
    });

});

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('k:m:s')
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on('locationMessage', (data) => {
    console.log(data);
    const html = Mustache.render($locationMessageTemplate, {
        username: data.username,
        location: data.location,
        createdAt: moment(data.createdAt).format('k:m:s')
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$sendLocationButton.addEventListener('click', (event) => {
    $sendLocationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        $sendLocationButton.removeAttribute('disabled');
        return alert('Location is not available');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const data = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        console.log(data);
        socket.emit('sendLocation', data, (acknowledgment) => {
            $sendLocationButton.removeAttribute('disabled');
            console.log(`Location was ${acknowledgment}`);
        });
    });
});

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});
/*
soket.on('countUpdated', (count) => {
    console.log('The count has been updated: ' + count);
});

document.querySelector('#increment').addEventListener('click', () => {
    soket.emit('increment');

    console.log('Clicked');
});*/
