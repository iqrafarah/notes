window.addEventListener("load", (event) => {
  const deletedNotesContainer = document.querySelector(".deletedNotes");
  let deletedNotes = JSON.parse(localStorage.getItem("deletedNotes")) || [];
  const tabsContainer = document.querySelector(".tabsItems");
  const createTabButtons = document.querySelectorAll(".createTab");

  tabsContainer.addEventListener("click", function (event) {
    const clickedTab = event.target.closest(".liItems a");

    if (clickedTab) {
      event.preventDefault();
      clickedTab.setAttribute("href", "../index.html");
      console.log(clickedTab);
      window.location.href = clickedTab.href;
    }
  });

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

        const tabContent = newTab.innerHTML;
        const tabData = { name: tabName, content: tabContent };
        newTab.setAttribute("data-tab", tabKey);
        tabsContainer.appendChild(newTab);
        localStorage.setItem(tabKey, JSON.stringify(tabData));
        console.log(tabKey);
      });
    });
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

  // Retrieve tab data from local storage and recreate tabs
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("tab-")) {
      const storedTabData = JSON.parse(localStorage.getItem(key));
      const newTab = document.createElement("ul");
      newTab.innerHTML = storedTabData.content;
      newTab.setAttribute("data-tab", key);
      if (!document.querySelector(`[data-tab="${key}"]`)) {
        tabsContainer.appendChild(newTab);
      }
    }
  }

  function showNotes() {
    deletedNotesContainer.innerHTML = "";
    deletedNotes.reverse().forEach((note) => {
      deletedNotesContainer.innerHTML += `
        <div class="box" data-index="${deletedNotes.indexOf(note)}">
          <div class="styles">
          <button class="bold">
            <i class="bx bx-bold fa-lg"></i>
          </button>
          <button class="italic">
            <i class="bx bx-italic fa-lg"></i>
          </button>
          <button class="underline">
            <i class="bx bx-underline fa-lg"></i>
          </button>
          <button class="strikeThrough">
            <i class="bx bx-strikethrough fa-lg"></i>
          </button>
          <button class="insertHTML">
            <i class="bx bx-check-square fa-lg"></i>
          </button>
          </div>
          <p class="input-box" contenteditable="false">${note}</p>
         <div class="icons">
         <div class="divIcons">
         <i class="bx bx-volume-full bx-sm sound"></i>
         <i class="bx bxs-microphone bx-sm mic"></i>
         <i class="bx bx-trash bx-sm remove"></i>
        </div>
      `;
      standardMessage();
    });
  }
  showNotes();

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
  function standardMessage() {
    const emptyMessage = document.querySelector(".empty-message");
    if (deletedNotesContainer.children.length === 0) {
      if (!emptyMessage) {
        const h1 = document.createElement("h1");
        h1.textContent = "Trash is empty";
        h1.className = "empty-message";
        deletedNotesContainer.appendChild(h1);
      }
    } else {
      if (emptyMessage) {
        emptyMessage.remove();
      }
    }
  }
  standardMessage();

  deletedNotesContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove")) {
      Swal.fire({
        title: "Are you sure?",
        text: "You are about to delete this note, this cannot be undone!",
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
          const noteIndex = Array.from(
            deletedNotesContainer.querySelectorAll(".box")
          ).indexOf(e.target.parentNode.parentNode);

          deletedNotes.splice(noteIndex, 1);
          updateStorage();
          showNotes();
          standardMessage();
        }
      });
    }
  });

  // Function to update local storage
  function updateStorage() {
    localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  }

  let isdarkmode;
  const DarkmodeToggle = document.querySelector(".darkmode-btn");
  DarkmodeToggle.addEventListener("click", () => {
    const body = document.body;
    body.classList.toggle("darkMode");

    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");

    if (isdarkmode) {
      DarkmodeToggle.innerHTML = "";
      DarkmodeToggle.innerHTML += `<i class="fa-solid fa-moon fa-xl" style="color: #fff"></i>
      `;
    } else {
      DarkmodeToggle.innerHTML = "";
      DarkmodeToggle.innerHTML += `
        <i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>
      `;
    }
    isdarkmode = !isdarkmode;

    if (document.body.classList.contains("darkMode")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  });

  // search
  const searchTerm = document.getElementById("searchBar");
  searchTerm.addEventListener("click", () => {
    searchTerm.addEventListener("keyup", function (event) {
      event.preventDefault();
      if (searchTerm.value != "") {
        const searchString = event.target.value.toLowerCase();
        if (searchString != "") {
          const searchFiltered = array.filter((item) => {
            return item.toLowerCase().includes(searchString);
          });
          deletedNotesContainer.innerHTML = "";
          if (searchFiltered != "") {
            searchFiltered.forEach((filter) => {
              deletedNotesContainer.innerHTML += `
          <div class="box">
          <div class="styles">
          <button class="bold">
            <i class="bx bx-bold fa-lg"></i>
          </button>
          <button class="italic">
            <i class="bx bx-italic fa-lg"></i>
          </button>
          <button class="underline">
            <i class="bx bx-underline fa-lg"></i>
          </button>
          <button class="strikeThrough">
            <i class="bx bx-strikethrough fa-lg"></i>
          </button>
          <button class="insertHTML">
            <i class="bx bx-check-square fa-lg"></i>
          </button>
          </div>
          <p class="input-box" contenteditable="false">${filter}</p>
         <div class="icons">
         <div class="divIcons">
         <i class="bx bx-volume-full bx-sm sound"></i>
         <i class="bx bxs-microphone bx-sm mic"></i>
         <i class="bx bx-trash bx-sm remove"></i>
        </div>
    `;
            });
          } else {
            deletedNotesContainer.innerHTML += `
            <p>Geen resultaat</p>
            `;
          }
        }
      } else {
        showNotes();
      }
    });
  });

  //darkmode
  if (localStorage.getItem("darkMode") == "enabled") {
    const body = document.body;
    body.classList.toggle("darkMode");
    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");
  }

  let inputBoxs = document.querySelectorAll(".input-box");
  let array = [];

  inputBoxs.forEach((inputBox) => {
    array.push(inputBox.innerHTML);
  });
});
