document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.querySelector(".addNote");
  const notesContainer = document.querySelector(".notes-container");
  let notes = document.querySelectorAll(".input-box");
  let speech = new SpeechSynthesisUtterance();

  // toont de notities die bewaard zijn
  function showNotes() {
    const notesHTML = localStorage.getItem("notes");
    notesContainer.innerHTML = notesHTML;
    getSound();
    getMic();
  }
  showNotes();

  // bewaart de notities
  function updateStorage() {
    localStorage.setItem("notes", notesContainer.innerHTML);
  }

  notesContainer.addEventListener("input", function () {
    updateStorage();
    standardMessage();
  });

  function standardMessage() {
    const emptyMessage = document.querySelector(".empty-message");
    if (notesContainer.children.length === 0) {
      if (!emptyMessage) {
        const h1 = document.createElement("h1");
        h1.textContent = "No notes available";
        h1.className = "empty-message";
        notesContainer.appendChild(h1);
      }
    } else {
      if (emptyMessage) {
        emptyMessage.remove();
      }
    }
  }
  standardMessage();

  const sidebar = document.querySelector(".sidebar");
  const btns = document.querySelectorAll("#btn");

  const isSidebarActive = localStorage.getItem("isSidebarActive") === "true";

  if (isSidebarActive) {
    sidebar.classList.add("active");
  }

  btns.forEach((btn) => {
    btn.onclick = function () {
      sidebar.classList.toggle("active");

      localStorage.setItem(
        "isSidebarActive",
        sidebar.classList.contains("active")
      );
    };
  });

  const tabsContainer = document.querySelector(".tabsItems");
  const createTabButtons = document.querySelectorAll(".createTab");

  function createTab() {
    createTabButtons.forEach((createTabButton) => {
      createTabButton.addEventListener("click", () => {
        const tabName = "New tab";
        const tabKey = `tab-${Date.now()}`;
        const newTab = document.createElement("ul");
        newTab.setAttribute("data-tab", tabKey);

        newTab.innerHTML = `
          <li class="liItems">
            <a href="#">
              <i class='bx bxs-circle'></i>                 
              <span class="tabItem nav-item item" contenteditable="false">${tabName}</span>
            </a> 
            <span class="tooltip tabItem">${tabName}</span>
            <i class='bx bxs-edit-alt tabIcons editTab fa-lg'></i>            
            <i class="fa-solid fa-times deleteTab tabIcons fa-lg"></i>
          </li>
        `;

        newTab.addEventListener("click", function () {
          const tabKey = this.getAttribute("data-tab");
          showNotesWithKey(tabKey);
        });

        const tabContent = newTab.innerHTML;

        const tabData = { name: tabName, content: tabContent };
        newTab.setAttribute("data-tab", tabKey);
        tabsContainer.appendChild(newTab);
        localStorage.setItem(tabKey, JSON.stringify(tabData));
      });
    });

    const activeTabKey = getCurrentTabKey();
  }

  createTab();

  window.addEventListener("DOMContentLoaded", (event) => {
    const tabs = document.querySelectorAll("[data-tab]");
    tabs.forEach((tab) => {
      const tabKey = tab.getAttribute("data-tab");
      const tabData = localStorage.getItem(tabKey);
      if (tabData) {
        const { name, content } = JSON.parse(tabData);
        const tabNameElement = tab.querySelector(".tabItem");
        const tabContentElement = tab.querySelector(".tab-content");
        if (tabNameElement) {
          tabNameElement.textContent = name || "New tab";
          tabNameElement.contentEditable = false;
        }
        if (tabContentElement) {
          tabContentElement.innerHTML = "content";
        }
      }
    });
  });

  // save the edited tab name
  tabsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("editTab")) {
      const tab = event.target.closest("ul");
      const tabNameElement = tab.querySelector(".tabItem");

      tabNameElement.contentEditable = true;
      tabNameElement.focus();
      // tabNameElement.textContent = "";

      tabNameElement.addEventListener("blur", function () {
        const updatedTabName = tabNameElement.textContent;
        const tabKey = tab.getAttribute("data-tab");
        const tabContent = tab.innerHTML;
        const tabData = { name: updatedTabName, content: tabContent };
        localStorage.setItem(tabKey, JSON.stringify(tabData));

        const tooltip = tab.querySelector(".tooltip");
        if (tooltip) {
          tooltip.textContent = updatedTabName;
        }

        tabNameElement.contentEditable = false;
      });
    }
  });

  // delete tab
  tabsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("deleteTab")) {
      const tab = event.target.closest("ul");
      const tabKey = tab.getAttribute("data-tab");

      Swal.fire({
        title: "Are you sure?",
        text: "You are about to delete this note, this cannot be undone!",
        // icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c81e1e",
        cancelButtonColor: "#fff",
        confirmButtonText: `<i class='bx bxs-trash' style='color:#fffefe'  ></i> Yes, delete it!`,
        customClass: {
          cancelButton: "swal-cancel-button-class",
          confirmButton: "swal-confirm-button-class",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          tab.remove();
          localStorage.removeItem(tabKey);

          let keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes(tabKey)) {
              keysToRemove.push(key);
            }
          }

          keysToRemove.forEach((key) => {
            localStorage.removeItem(key);
          });

          // const notesContainer = document.querySelector(".notes-container");
          showNotesWithKey(getCurrentTabKey());

          updateStorage();
          Swal.fire("Deleted!", "Your tab has been deleted.", "success");
          standardMessage();
        }
      });
    }
  });

  // Loop through stored tab data and render tabs and notes
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("tab-")) {
      const storedTabData = JSON.parse(localStorage.getItem(key));
      const newTab = document.createElement("ul");
      newTab.setAttribute("data-tab", key);
      newTab.innerHTML = storedTabData.content;

      tabsContainer.appendChild(newTab);

      const notesInTab = newTab.querySelectorAll("[data-tab]");
      notesInTab.forEach((note) => {
        const noteTabKey = note.getAttribute("data-tab");
        if (noteTabKey === key) {
          const activeTab = document.querySelector(`[data-tab="${key}"]`);
          activeTab.appendChild(note);
        }
      });
    }
  }

  function getCurrentTabKey() {
    const activeTab = document.querySelector(".tabsItems .activeTab");
    if (activeTab) {
      return activeTab.getAttribute("data-tab");
    }
    return null;
  }

  function getBoxValue(box) {
    return box.querySelector(".input-box").innerHTML;
  }

  const allNotes = Array.from(notesContainer.querySelectorAll(".box"));

  const allTabs = Array.from(tabsContainer.querySelectorAll(".tabItem"));

  function showNotesWithKey(tabKey) {
    const allNotes = Array.from(document.querySelectorAll(".box"));
    const notesContainer = document.querySelector(".notes-container");

    const hiddenNotes = [];
    const visibleNotes = [];

    allNotes.forEach((note) => {
      const noteTabKey = note.getAttribute("data-tab");
      const activeNote = note.querySelector(".input-box");
      const noteContent = getBoxValue(note);

      if (noteTabKey === tabKey) {
        if (noteContent.trim() !== "") {
          activeNote.innerHTML = noteContent;
          note.classList.remove("hidden");
          visibleNotes.push(note);
        } else {
          activeNote.innerHTML = "";
          note.classList.add("hidden");
          hiddenNotes.push(note);
        }
      } else {
        note.classList.add("hidden");
        hiddenNotes.push(note);
      }
    });

    notesContainer.innerHTML = "";
    visibleNotes.forEach((note) => {
      notesContainer.appendChild(note);
    });
    hiddenNotes.forEach((note) => {
      notesContainer.appendChild(note);
    });

    if (notesContainer.children.length === 0) {
      standardMessage();
    }
  }

  allTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabKey = tab.closest("ul").getAttribute("data-tab");
      showNotesWithKey(tabKey);
      localStorage.setItem("activeTabKey", tabKey);
    });
  });

  const activeTabKey = localStorage.getItem("activeTabKey");
  if (activeTabKey) {
    const activeTab = document.querySelector(`[data-tab="${activeTabKey}"]`);
    if (activeTab) {
      activeTab.classList.add("activeTab");

      showNotesWithKey(activeTabKey);
    }
  }

  function getCurrentTabKey() {
    const activeTab = document.querySelector(".tabItem.activeTab");
    if (activeTab) {
      const tabKey = activeTab.closest("ul").getAttribute("data-tab");
      return tabKey;
    }
    const firstTab = document.querySelector(".tabItem");
    if (firstTab) {
      return firstTab.closest("ul").getAttribute("data-tab");
    }
    return "default-tab-key";
  }
  tabsContainer.addEventListener("click", function (event) {
    const clickedTab = event.target.closest(".liItems a");

    if (clickedTab) {
      event.preventDefault();
      clickedTab.setAttribute("href", "#");
      console.log(clickedTab);
      window.location.href = clickedTab.href;
    }
  });

  tabsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("tabItem")) {
      const allTabs = document.querySelectorAll(".tabItem");
      allTabs.forEach((tab) => {
        tab.classList.remove("activeTab");
      });

      event.target.classList.add("activeTab");

      showNotesWithKey(getCurrentTabKey());
    }
  });

  if (activeTabKey) {
    const activeTab = document.querySelector(`[data-tab="${activeTabKey}"]`);
    if (activeTab) {
      const allTabs = document.querySelectorAll(".tabItem");
      allTabs.forEach((tab) => {
        tab.classList.remove("activeTab");
      });

      activeTab.classList.add("activeTab");

      showNotesWithKey(activeTabKey);
    }
  } else {
    const firstTab = document.querySelector(".tabItem ");
    if (firstTab) {
      firstTab.classList.add("activeTab");
      showNotesWithKey(firstTab.closest("ul").getAttribute("data-tab"));
    }
  }

  // aanmaken van een notitie
  addBtn.addEventListener("click", () => {
    const activeTab = getCurrentTabKey();
    if (!activeTab) {
      alert("Please select a tab to add a note.");
      return;
    }

    let inputBox = document.createElement("p");
    inputBox.setAttribute("contenteditable", "true");
    inputBox.textContent = "take note...";

    inputBox.addEventListener("focus", function () {
      if (this.textContent === "take note...") {
        this.textContent = "";
      }
    });

    inputBox.className = "input-box";

    let styles = document.createElement("div");
    styles.className = "styles";

    const boldBtn = createStyleButton("bold", "bx-bold");
    const italicBtn = createStyleButton("italic", "bx-italic");
    const underlineBtn = createStyleButton("underline", "bx-underline");
    const strikethroughBtn = createStyleButton(
      "strikeThrough",
      "bx-strikethrough"
    );
    const todoBtn = createStyleButton(
      "insertHTML",
      "bx-check-square",
      '<input class="checkbox" type="checkbox"> '
    );

    function createStyleButton(command, iconClass, commandValue = null) {
      const button = document.createElement("button");
      button.className = command;
      const icon = document.createElement("i");
      icon.className = `bx ${iconClass} fa-lg`;
      button.appendChild(icon);

      button.onclick = function () {
        document.execCommand(command, false, commandValue);
      };

      return button;
    }

    // Append style buttons to the styles div
    styles.appendChild(boldBtn);
    styles.appendChild(italicBtn);
    styles.appendChild(underlineBtn);
    styles.appendChild(strikethroughBtn);
    styles.appendChild(todoBtn);

    const remove = document.createElement("i");
    remove.className = "bx bx-trash bx-sm remove";

    let sound = document.createElement("i");
    sound.className = "bx bx-volume-full bx-sm sound";

    let mic = document.createElement("i");
    mic.className = "bx bxs-microphone bx-sm mic";

    let box = document.createElement("div");
    box.className = "box";
    box.setAttribute("data-tab", getCurrentTabKey());

    let divIcons = document.createElement("div");
    divIcons.className = "divIcons";

    let icons = document.createElement("div");
    icons.className = "icons";

    divIcons.appendChild(sound);
    divIcons.appendChild(mic);
    divIcons.appendChild(remove);

    icons.append(divIcons);
    array.push(inputBox.textContent);

    function debounce(func, delay) {
      let timeout;
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(context, args);
        }, delay);
      };
    }
    let lastUpdateTime = localStorage.getItem("lastUpdateTime");

    if (!lastUpdateTime || isNaN(new Date(lastUpdateTime))) {
      lastUpdateTime = new Date().toISOString();
      localStorage.setItem("lastUpdateTime", lastUpdateTime);
    }

    function updateDateTime() {
      const currentDate = new Date();
      const timeDifference = Math.floor(
        (currentDate - new Date(lastUpdateTime)) / 1000
      );

      let formattedDateTime = "";

      if (timeDifference < 60) {
        formattedDateTime = "just now";
      } else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        formattedDateTime = `${minutes}m ago`;
      } else if (timeDifference < 86400) {
        const hours = Math.floor(timeDifference / 3600);
        formattedDateTime = `${hours}h ago`;
      } else {
        const days = Math.floor(timeDifference / 86400);
        formattedDateTime = `${days}d ago`;
      }

      const lastChild = icons.lastChild;
      if (
        lastChild &&
        lastChild.nodeType === Node.TEXT_NODE &&
        lastChild.textContent === formattedDateTime
      ) {
        return;
      }

      const dateTimeNode = document.createTextNode(formattedDateTime);
      if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
        icons.replaceChild(dateTimeNode, lastChild);
      } else {
        icons.append(dateTimeNode);
      }

      localStorage.setItem("lastUpdateTime", currentDate.toISOString()); // Save the current timestamp in ISO format
    }
    const intervalTime = 1000; // Update every 1000 milliseconds (1 second)
    setInterval(updateDateTime, intervalTime);

    updateDateTime(); // Call updateDateTime once on page load

    // Optionally, update the time when the input box loses focus
    // inputBox.addEventListener("blur", updateDateTime);

    box.append(styles);

    // Set the lastUpdateTime to the current date and time
    localStorage.setItem("lastUpdateTime", new Date().toISOString());
    box.appendChild(inputBox);
    box.append(icons);

    notesContainer.insertBefore(box, notesContainer.firstChild);

    getSound();
    getMic();

    sound.addEventListener("click", () => {
      updateStorage();
      let inputValue = inputBox.textContent;
      speech.text = inputValue;
      window.speechSynthesis.speak(speech);
    });

    standardMessage();
  });

  const styleButtons = document.querySelectorAll(".styles button");

  styleButtons.forEach((styleButton) => {
    styleButton.addEventListener("click", function (event) {
      const command = styleButton.classList[0]; // Get the command from the button's class name
      let commandValue = null;

      if (command === "todo") {
        commandValue = '<input class="checkbox" type="checkbox"> ';
      }

      if (
        command === "bold" ||
        command === "italic" ||
        command === "underline" ||
        command === "strikethrough"
      ) {
        document.execCommand(command, false, null);
      } else {
        document.execCommand(command, false, commandValue); // Execute the command
      }

      updateStorage(); // Update the storage after applying the formatting

      // event.preventDefault(); // Prevent the button from performing default browser behavior (e.g., form submission)
    });
  });

  // verwijderd de notitie
  notesContainer.addEventListener("click", function (e) {
    if (event.target.classList.contains("remove")) {
      Swal.fire({
        title: "Are you sure?",
        text: "You are about to delete this note, this cannot be undone!",
        // icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c81e1e",
        cancelButtonColor: "#fff",
        confirmButtonText: `<i class='bx bxs-trash' style='color:#fffefe'  ></i> Yes, delete it!`,
        customClass: {
          cancelButton: "swal-cancel-button-class",
          confirmButton: "swal-confirm-button-class",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const deletedNote = e.target.parentNode.parentNode.parentNode;
          const deletedNoteText =
            deletedNote.querySelector(".input-box").textContent;
          saveDeletedNoteToStorage(deletedNoteText);

          deletedNote.remove();

          e.target.parentNode.parentNode.remove();

          updateStorage();
          array = Array.from(
            notesContainer.querySelectorAll(".input-box"),
            (inputBox) => inputBox.innerHTML
          );
          standardMessage();
          Swal.fire("Deleted!", "Your note has been deleted.", "success");
        }
      });
      standardMessage();
    } else if (e.target.tagName === "P") {
      notes = document.querySelectorAll(".box");
      notes.forEach((nt) => {
        nt.onkeyup = function () {
          updateStorage();
          let inputBox = nt.querySelector(".input-box");
          updateSpeechText(inputBox);
          array = Array.from(
            notesContainer.querySelectorAll(".input-box"),
            (inputBox) => inputBox.innerHTML
          );
        };
      });
    }
  });

  function saveDeletedNoteToStorage(deletedNoteText) {
    let deletedNotes = JSON.parse(localStorage.getItem("deletedNotes")) || [];
    deletedNotes.push(deletedNoteText);
    localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  }

  // als je op enter klikt krijg je een regeleinde
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      updateStorage();
      document.execCommand("insertLineBreak");
      event.preventDefault();
    }
  });

  // zorgt voor de speech
  function updateSpeechText(inputBox) {
    let inputValue = inputBox.textContent;
    speech.text = inputValue;
  }

  function getSound() {
    let sounds = document.querySelectorAll(".sound");
    sounds.forEach((sound) => {
      sound.addEventListener("click", () => {
        let inputBox = sound.closest(".box").querySelector(".input-box");

        if (inputBox) {
          updateSpeechText(inputBox);
          window.speechSynthesis.speak(speech);
        }
      });
    });
  }

  // mic function
  function getMic() {
    let mics = document.querySelectorAll(".mic");
    mics.forEach((mic) => {
      mic.addEventListener("click", () => {
        const recognition = new webkitSpeechRecognition();
        recognition.start();

        recognition.onresult = function (event) {
          const result = event.results[0][0].transcript;

          const activeInputBox = mic
            .closest(".box")
            .querySelector(".input-box");
          if (activeInputBox) {
            if (activeInputBox.textContent.trim() === "take note...") {
              activeInputBox.textContent = "";
            }
          }
          if (activeInputBox) {
            activeInputBox.innerHTML += `\n` + result;
            updateStorage();

            array = Array.from(
              notesContainer.querySelectorAll(".input-box"),
              (inputBox) => inputBox.innerHTML
            );
          }
        };

        recognition.onerror = function (event) {
          console.error("Speech Recognition Error: ", event.error);
        };
      });
    });
  }
  getMic();

  // haalt de inputbox data op en stop het in een array
  let inputBoxs = document.querySelectorAll(".input-box");
  let array = [];

  inputBoxs.forEach((inputBox) => {
    array.push(inputBox.innerHTML);
  });

  const searchTerm = document.getElementById("searchBar");
  searchTerm.addEventListener("input", function (event) {
    const searchString = event.target.value.toLowerCase();
    const allNotes = Array.from(document.querySelectorAll(".box"));

    allNotes.forEach((note) => {
      const noteText = note
        .querySelector(".input-box")
        .textContent.toLowerCase();
      if (noteText.includes(searchString)) {
        note.style.display = ""; // Show note if it matches
      } else {
        note.style.display = "none"; // Hide note if it doesn't match
      }
    });

    if (searchTerm.value == "") {
      showNotesAll(); // Call a function to show all notes when the search bar is empty
    }
  });

  function showNotesAll() {
    const allNotes = Array.from(document.querySelectorAll(".box"));
    allNotes.forEach((note) => {
      note.style.display = ""; // Show all notes
    });
  }

  showNotesAll();

  // Darkmode
  let isdarkmode;
  const DarkmodeToggle = document.querySelector(".darkmode-btn");
  const tabsStandard = document.querySelector(".tabsStandard");
  const isDarkModeEnabled = localStorage.getItem("darkMode") === "enabled";

  if (isDarkModeEnabled) {
    DarkmodeToggle.innerHTML = `<i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>`;
  } else {
    DarkmodeToggle.innerHTML = `<i class="fa-solid fa-moon fa-xl" style="color: #fff"></i>`;
  }

  isdarkmode = !isdarkmode;

  DarkmodeToggle.addEventListener("click", () => {
    const body = document.body;
    document.body.classList.toggle("darkMode");

    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");

    const isDarkModeEnabled = document.body.classList.contains("darkMode");
    localStorage.setItem(
      "darkMode",
      isDarkModeEnabled ? "enabled" : "disabled"
    );

    if (isDarkModeEnabled) {
      DarkmodeToggle.innerHTML = `<i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>`;
    } else {
      DarkmodeToggle.innerHTML = `<i class="fa-solid fa-moon fa-xl" style="color: #fff"></i>`;
    }
  });

  if (localStorage.getItem("darkMode") == "enabled") {
    const body = document.body;
    body.classList.toggle("darkMode");
    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");
  }
});
