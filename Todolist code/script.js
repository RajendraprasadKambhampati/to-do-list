function showDivisionsWithDelay() {
    const cardDivisions = document.querySelectorAll(".card");
    const delay = 300;

    cardDivisions.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = 1;
        }, (index + 1) * delay);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('duedate').valueAsDate = new Date();
    const taskContainer = document.getElementById("TaskContainer");
    const addButton = document.querySelector(".bx-plus");
    const textInput = document.getElementById("taskInput");
    const dateInput = document.getElementById("duedate");
    const titleLink = document.getElementById("header_title");
    const searchInput = document.getElementById("search");

    const generateNumericID = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

    const saveData = () => {
        const taskDescription = textInput.value.trim();
        const dueDate = dateInput.value;

        if (!taskDescription || !dueDate) {
            swal({
                title: "Error",
                text: "Please enter both task and due date!",
                icon: "error",
            });
            return;
        }

        const id = generateNumericID();
        const task = {
            id: id,
            text: taskDescription,
            date: dueDate,
            completed: false,
            timestamp: Date.now(),
        };

        localStorage.setItem(id, JSON.stringify(task));

        textInput.value = "";
        dateInput.valueAsDate = new Date();
        displayTasks(currentSection);
    };

    addButton.addEventListener("click", saveData);
    textInput.addEventListener("keypress", (event) => { if (event.key === "Enter") saveData(); });
    dateInput.addEventListener("keypress", (event) => { if (event.key === "Enter") saveData(); });

    const displayTasks = (section, searchQuery = "") => {
        currentSection = section;
        const tasks = Object.entries(localStorage)
            .filter(([key]) => key !== "userPreferences")
            .map(([, task]) => {
                try {
                    return JSON.parse(task);
                } catch (error) {
                    console.error("Error parsing task:", task, error);
                    return null; 
                }
            })
            .filter(task => task && task.text); 

        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

        titleLink.textContent = {
            myDay: "My Day",
            completed: "Completed Tasks",
            notCompleted: "Not Completed Tasks",
            other: "All Tasks"
        }[section] || "All Tasks";

        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.text && task.text.toLowerCase().includes(searchQuery.toLowerCase());
            switch (section) {
                case "myDay": return task.date === new Date().toISOString().slice(0, 10) && matchesSearch;
                case "completed": return task.completed && matchesSearch;
                case "notCompleted": return !task.completed && matchesSearch;
                case "other": return matchesSearch;
                default: return false;
            }
        });

        taskContainer.innerHTML = filteredTasks.map(task => `
            <div class="card align" data-task-id="${task.id}">
                <input type="checkbox" id="${task.id}" ${task.completed ? "checked" : ""}>
                <div class="marker ${task.completed ? "done" : ""}">
                    <span>${task.text}</span>
                    <p class="date">${task.date}</p>
                </div>
                <i class="bx bx-trash-alt"></i>
            </div>
        `).join("");

        taskContainer.addEventListener("click", (event) => {
            if (event.target.type === "checkbox") {
                const taskId = event.target.id;
                const task = tasks.find(t => t.id.toString() === taskId);
                if (task) {
                    task.completed = event.target.checked;
                    localStorage.setItem(task.id, JSON.stringify(task));
                    event.target.nextElementSibling.classList.toggle("done", task.completed);
                }
            }

            if (event.target.classList.contains("bx-trash-alt")) {
                const taskId = event.target.closest(".card").dataset.taskId;
                swal({
                    title: "Delete current task?",
                    text: "Once deleted, you will not be able to recover this task!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        localStorage.removeItem(taskId);
                        event.target.closest(".card").remove();
                        swal("Proof! Your task has been deleted!", { icon: "success" });
                    }
                });
            }
        });

        showDivisionsWithDelay();
    };

    let currentSection = "myDay";
    displayTasks(currentSection);

    document.getElementById("o1").addEventListener("click", () => displayTasks("myDay"));
    document.getElementById("o2").addEventListener("click", () => displayTasks("completed"));
    document.getElementById("o3").addEventListener("click", () => displayTasks("notCompleted"));
    document.getElementById("o4").addEventListener("click", () => displayTasks("other"));

    searchInput.addEventListener("input", () => {
        const searchQuery = searchInput.value;
        displayTasks(currentSection, searchQuery);
    });

    const burgerIcon = document.getElementById('burgerIcon');
    const containerLeft = document.getElementById('containerLeft');

    burgerIcon.addEventListener('click', () => {
        containerLeft.classList.toggle('v-class');
        burgerIcon.classList.toggle('cross');
    });

    document.body.addEventListener('click', (event) => {
        if (!containerLeft.contains(event.target) && !burgerIcon.contains(event.target)) {
            containerLeft.classList.remove('v-class');
            burgerIcon.classList.remove('cross');
        }
    });
});
