document.addEventListener('DOMContentLoaded', function() {
    let calendarEl = document.getElementById('calendar');
    const selectedDateEl = document.getElementById('selected-date');
    const eventNameInput = document.getElementById('event-name');
    const addEventBtn = document.getElementById('add-event');
    const eventListEl = document.getElementById('event-list');
    const errorModalEl = document.getElementById('errorModal');

    let storedEvents = localStorage.getItem('eventList');
    let eventList = storedEvents ? JSON.parse(storedEvents) : {};

    let selectedDate = null;

    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        dateClick: function(info) {
            selectedDate = info.dateStr;
            selectedDateEl.textContent = selectedDate;
            updateEventList();
        }
    });

    Object.values(eventList).forEach(eventArray => {
        eventArray.forEach(event => {
            calendar.addEvent(event);
        });
    });

    calendar.render();

    addEventBtn.addEventListener('click', function() {
        let eventName = eventNameInput.value;

        if (selectedDate && eventName) {
            let event = {
                id: Date.now().toString(),
                title: eventName,
                start: selectedDate
            };

            calendar.addEvent(event);

            if (!eventList[selectedDate]) {
                eventList[selectedDate] = [];
            }
            eventList[selectedDate].push(event);

            localStorage.setItem('eventList', JSON.stringify(eventList));
            updateEventList();
            eventNameInput.value = '';

        } else {
            errorModalEl.classList.add('show');
            errorModalEl.style.display = 'block';
            errorModalEl.setAttribute('aria-modal', 'true');
            errorModalEl.setAttribute('role', 'dialog');

            errorModalEl.querySelector('.btn-close').addEventListener('click', function() {
                errorModalEl.classList.remove('show');
                errorModalEl.style.display = 'none';
            });
        }
    });

    function updateEventList() {
        eventListEl.innerHTML = '';

        if (eventList[selectedDate]) {
            eventList[selectedDate].forEach(function(event) {
                addEventToList(event);
            });
        }
    }

    function addEventToList(event) {
        let li = document.createElement('li');
    
        li.innerHTML = `
            <strong>Событие:</strong>
            <span style="color: #007bff;">${event.title}</span>
            <button type="button"  class="btn-edit" id="edit-event-btn">
                <img src="./images/edit-btn.svg" alt="#">
            </button>
            <button type="button" class="btn-close" id="delete-event-btn"></button>
        `;

        const deleteBtn = li.querySelector('#delete-event-btn');
        deleteBtn.addEventListener('click', function() {
            deleteEventFromList(event);
            li.remove();
        });

        const editBtn = li.querySelector('#edit-event-btn');
        editBtn.addEventListener('click', function() {
            // TODO: появляется поле ввода для изменения названия события
        });
        
        eventListEl.appendChild(li);
    }

    function deleteEventFromList(event) {
        const index = eventList[selectedDate].findIndex(e => e.title === event.title && e.start === event.start);
        // findIndex() ищет событие, у которого совпадают заголовок (e.title) и дата начала (e.start) 
        // с переданным в функцию событием (event.title и event.start). 
        // Если совпадение найдено, возвращается индекс события, 
        // если нет — возвращается -1
    
        if (index !== -1) {
            eventList[selectedDate].splice(index, 1);

            const calendarEvent = calendar.getEventById(event.id);
            if (calendarEvent) {
                calendarEvent.remove();
            }

            if (eventList[selectedDate].length === 0) {
                delete eventList[selectedDate];
            }
    
            localStorage.setItem('eventList', JSON.stringify(eventList));
        }
    }
});
