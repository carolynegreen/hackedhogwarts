"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let allBloodStatus = [];
let expelledStudents = [];

let popup = document.querySelector("#popup");
let closePop = document.querySelector("#close");

const Student = {
  imageUrl: "",
  firstName: "",
  lastName: "",
  middleName: "",
  nickname: "",
  gender: "",
  house: "",
  bloodstatus: "",
  prefect: false,
  squad: false,
  expel: false,
};

const settings = {
  filter: "all",
  sortBy: "firstName",
  sortDir: "asc",
  hacked: false,
};

function start() {
  console.log("ready");

  registerButtons();
  loadJSON();
  registerSearch();
  registerExpelledStudents();
  document.querySelector("#hack").addEventListener("click", hackTheSystem);
}

function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));
  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", selectSort));
}

function registerExpelledStudents() {
  document
    .querySelector("[data-filter='expelledstudents']")
    .addEventListener("click", displayExpelledStudent);
}

function registerSearch() {
  document.querySelector("#search").addEventListener("input", searchStudent);
}

async function loadJSON() {
  console.log("loadJS");
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
  const jsonData = await response.json();
  const responseBlood = await fetch(
    "https://petlatkea.dk/2021/hogwarts/families.json"
  );
  const jsonDataBlood = await responseBlood.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData, jsonDataBlood);
}

function prepareObjects(jsonData, jsonDataBlood) {
  allStudents = jsonData.map(prepareObject);

  //blood status
  allBloodStatus = jsonDataBlood;
  setBloodStatus(jsonDataBlood);

  // fixed TODO: Add filtering here !!! This might not be the function we want to call first
  console.log(allStudents);
  buildList();
}

function setBloodStatus(jsonDataBlood) {
  allStudents.forEach((student) => {
    if (jsonDataBlood.half.includes(student.lastName)) {
      student.bloodstatus = "half-blood";
    } else if (jsonDataBlood.pure.includes(student.lastName)) {
      student.bloodstatus = "pure-blood";
    } else {
      student.bloodstatus = "muggleborn";
    }
  });
  return student;
}

function prepareObject(jsonObject) {
  const student = Object.create(Student); // new object with cleaned data

  student.firstName = getStudentsName(jsonObject.fullname.trim());
  student.lastName = getStudentsLastName(jsonObject.fullname.trim());
  student.middleName = getStudentsMiddleName(jsonObject.fullname.trim());
  student.nickname = getStudentsNickname(jsonObject.fullname.trim());
  student.house = getHouse(jsonObject.house.trim());
  student.imageUrl = getImage(student.lastName, student.firstName);
  // console.log(student);
  return student;
}

function searchStudent() {
  let search = document.querySelector("#search").value.toLowerCase();
  let searchResult = allStudents.filter(filterSearch);

  function filterSearch(student) {
    //Searching firstName and lastLame
    if (
      student.firstName.toString().toLowerCase().includes(search) ||
      student.lastName.toString().toLowerCase().includes(search)
    ) {
      return true;
    } else {
      return false;
    }
  }

  if (search == " ") {
    displayList(allStudents);
  }

  displayList(searchResult);
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`user selected ${filter}`);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter; //sending the filter param to the global object
  buildList();
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //adding styling- indicator of how it is sorted at the moment
  //find old sort b
  const old = document.querySelector(`[data-sort="${settings.sortBy}"]`);
  old.classList.remove("sortby");
  //indicate active sort
  event.target.classList.add("sortby");

  //toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  console.log(`user selected ${sortBy} ${sortDir}`);
  setSort(sortBy, sortDir); // sending  two parameters to the setSort function
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy; // adding those parameters to the global object
  settings.sortDir = sortDir;

  buildList();
}

function filterList(filteredList) {
  //let filteredList = allStudents;

  if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  }
  return filteredList;
}

function isGryffindor(student) {
  return student.house === "Gryffindor"; // ---> to samo co warunek skrót!!
}
/// --- FILTERS ------
function isSlytherin(student) {
  return student.house === "Slytherin"; // ---> to samo co warunek skrót!!
}

function isHufflepuff(student) {
  return student.house === "Hufflepuff"; // ---> to samo co warunek skrót!!
}
function isRavenclaw(student) {
  return student.house === "Ravenclaw"; // ---> to samo co warunek skrót!!
}
/// --- END OF FILTERS ------

function displayExpelledStudent() {
  console.log("Show expelled students");
  displayList(expelledStudents);
}

function sortList(sortedList) {
  let direction = 1;

  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(A, B) {
    if (A[settings.sortBy] < B[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
  console.log(students);
  displayNumbers(students);
}

function displayStudent(student) {
  // create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=first-name]").textContent =
    student.firstName;
  clone.querySelector("[data-field=middle-name]").textContent =
    student.middleName;
  clone.querySelector("[data-field=last-name]").textContent = student.lastName;
  clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=house]").textContent = student.house;

  if (student.prefect === true) {
    clone.querySelector("[data-field=prefect]");
  } else {
    clone.querySelector("[data-field=prefect]");
  }
  // Prefects
  clone
    .querySelector("[data-field=prefect]")
    .addEventListener("click", clickPrefect);

  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakeAPrefect(student);
    }
    buildList();
  }

  clone
    .querySelector("[data-field=first-name]")
    .addEventListener("click", () => showPopUp(student));
  closePop.addEventListener("click", () => (popup.style.display = "none"));
  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

//popup

function showPopUp(student) {
  console.log("pop up");
  closePop.style.display = "";
  popup.style.display = "";

  popup.classList.remove("hidden");

  popup.querySelector(".student_image").src = `images/${student.imageUrl}`;
  popup.querySelector(
    ".name"
  ).textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;

  popup.querySelector(".house").textContent = student.house;
  popup.querySelector(
    ".blood"
  ).textContent = `Blood status: ${student.bloodstatus}`;
  popup.querySelector(".crest_img").src = `images/${student.house}.svg`;

  if (student.prefect === true) {
    popup.querySelector(".prefect").textContent = `Prefect:  ★  is prefect`;
  } else {
    popup.querySelector(".prefect").textContent = `Prefect:  ☆  not prefect`;
  }

  //expell
  if (student.expel === true) {
    popup.querySelector("#expell").style.backgroundColor = "black";
    popup.querySelector("#expell").style.cursor = "";
    popup.querySelector("#expell").textContent = "EXPELLED";
  } else {
    popup.querySelector("#expell").style.backgroundColor = "transparent";
    popup.querySelector("#expell").style.cursor = "pointer";
    popup.querySelector("#expell").textContent = "EXPELL";

    // Add Expelled in popup
    document.querySelector("#expell").addEventListener("click", clickExpel);
  }

  function clickExpel() {
    student.expel = true;

    popup.querySelector("#expell").style.backgroundColor = "black";
    popup.querySelector("#expell").style.cursor = "";
    popup.querySelector("#expell").textContent = "EXPELLED";
    popup.querySelector(".expel_stat").textContent = `Student status: expelled`;
    document.querySelector("#expell").removeEventListener("click", clickExpel);
    expelTheStudent(student);

    buildList();
  }

  if (student.expel === true) {
    popup.querySelector(".expel_stat").textContent = `Student status: expelled`;
  } else {
    popup.querySelector(".expel_stat").textContent = `Student status: active`;
  }

  /// ADD TO SQUAD
  if (student.squad === true) {
    popup.querySelector(
      ".squad_stat"
    ).textContent = `Inquisitorial squad: member`;
    document.querySelector("#squad").textContent = "REMOVE FROM SQUAD";
    document
      .querySelector("#squad")
      .addEventListener("click", clickRemoveSquad);
  } else {
    popup.querySelector(
      ".squad_stat"
    ).textContent = `Inquisitorial squad: not a member`;
    document.querySelector("#squad").textContent = "ADD TO SQUAD";
    document.querySelector("#squad").addEventListener("click", clickAddSquad);
  }

  function clickAddSquad() {
    document
      .querySelector("#squad")
      .removeEventListener("click", clickAddSquad);
    if (student.squad === true) {
      student.squad = false;
    } else {
      tryToBeINSquad(student);
    }
    buildList();
  }

  function clickRemoveSquad() {
    document
      .querySelector("#squad")
      .removeEventListener("click", clickRemoveSquad);
    student.squad = false;
    document.querySelector(
      ".squad_stat"
    ).textContent = `Inquisitorial squad: not a member`;
    document.querySelector("#squad").textContent = "ADD TO SQUAD";
    document.querySelector("#squad").addEventListener("click", clickAddSquad);
    buildList();
  }

  function tryToBeINSquad(selectedStudent) {
    if (selectedStudent.house === "Slytherin") {
      addToSquad(selectedStudent);
    } else if (selectedStudent.bloodstatus === "pure-blood") {
      addToSquad(selectedStudent);
    } else {
      selectedStudent.squad = false;
      tryAgain();
    }
  }

  function addToSquad(selectedStudent) {
    selectedStudent.squad = true;
    document.querySelector(
      ".squad_stat"
    ).textContent = `Inquisitorial squad: member`;
    document.querySelector("#squad").textContent = "REMOVE FROM SQUAD";
    document
      .querySelector("#squad")
      .addEventListener("click", clickRemoveSquad);
  }

  function tryAgain() {
    document.querySelector("#can_not_add").classList.remove("hide");
    document
      .querySelector("#can_not_add .close_warning")
      .addEventListener("click", closeDialog);
    document
      .querySelector("#can_not_add .removeother")
      .addEventListener("click", closeDialog);
  }
  //if ignore - do nothing
  function closeDialog() {
    document.querySelector("#can_not_add").classList.add("hide");
    document
      .querySelector("#can_not_add .close_warning")
      .removeEventListener("click", closeDialog);
    document
      .querySelector("#can_not_add .removeother")
      .removeEventListener("click", closeDialog);
  }

  // set the pop up color according to the houses

  if (student.house === "Slytherin") {
    document.querySelector("#popup").style.color = "#d6d5d5";
    document.querySelector("#popup").style.backgroundColor = "#1A472A";
    document.querySelector("#popup").style.border = "3px solid #5D5D5D ";
    document.querySelector("#stud_img").style.border = "1px solid #5D5D5D ";
    document.querySelector("#house_crest").style.border =
      "1.5px solid #5D5D5D ";
    document.querySelector("#house").style.color = "#586F68";
    document.querySelector("#expell").style.color = "#5D5D5D";
    document.querySelector(".name").style.color = "#d6d5d5";
    document.querySelector("#squad").style.color = "#5D5D5D";
  } else if (student.house === "Hufflepuff") {
    document.querySelector("#popup").style.color = "#1b1d19";
    document.querySelector("#popup").style.backgroundColor = "#ffc543";
    document.querySelector("#popup").style.border = "3px solid #1b1d19";
    document.querySelector("#stud_img").style.border = "1.5px solid #1b1d19";
    document.querySelector("#house").style.color = "#B47C00";
    document.querySelector("#expell").style.color = "#B47C00";
    document.querySelector(".name").style.color = "#1b1d19";
    document.querySelector("#squad").style.color = "#B47C00";
  } else if (student.house === "Gryffindor") {
    document.querySelector("#popup").style.color = "#d6d5d5";
    document.querySelector("#popup").style.backgroundColor = "#4e0d12";
    document.querySelector("#popup").style.border = "3px solid #ffc543";
    document.querySelector("#stud_img").style.border = "1.5px solid #ffc543";
    document.querySelector("#house").style.color = "#ffc543";
    document.querySelector("#expell").style.color = "#ffc543";
    document.querySelector(".name").style.color = "#d6d5d5";
    document.querySelector("#squad").style.color = "#ffc543";
  } else if (student.house === "Ravenclaw") {
    document.querySelector("#popup").style.color = "#d6d5d5";
    document.querySelector("#popup").style.backgroundColor = "#203665";
    document.querySelector("#popup").style.border = "3px solid  #ffc543";
    document.querySelector("#stud_img").style.border = "1.5px solid #ffc543";
    document.querySelector("#house").style.color = "#ffc543";
    document.querySelector("#expell").style.color = "#ffc543";
    document.querySelector("#squad").style.color = "#ffc543";
    document.querySelector(".name").style.color = "#d6d5d5";
  }
}

// ------> END OF POP UP

function expelTheStudent(student) {
  console.log("Expel the student");
  allStudents.splice(allStudents.indexOf(student), 1);
  expelledStudents.push(student);
}

/// ------> PREFECTS

function tryToMakeAPrefect(selectedStudent) {
  const allPrefects = allStudents.filter((student) => student.prefect);
  const prefects = allPrefects.filter(
    (prefect) => prefect.house === selectedStudent.house
  );

  const other = prefects
    .filter(
      (prefects) =>
        prefects.house === selectedStudent.house &&
        prefects.gender === selectedStudent.gender
    )
    .shift();

  // if there is another of the same type, house && gender
  if (other !== undefined) {
    console.log("there can only be one prefect of each type");
    removeOther(other);
  } else {
    makePrefect(selectedStudent);
  }

  function removeOther(other) {
    // ask the user to ignore or remove the other
    document.querySelector("#remove_other").classList.remove("hide");
    document
      .querySelector("#remove_other .close_warning")
      .addEventListener("click", closeWarn);
    document
      .querySelector("#remove_other .removeother")
      .addEventListener("click", clickRemoveOther);

    document.querySelector(
      "#remove_other [data-field=otherprefect]"
    ).textContent = other.firstName;

    //if ignore - do nothing
    function closeWarn() {
      document.querySelector("#remove_other").classList.add("hide");
      document
        .querySelector("#remove_other .close_warning")
        .removeEventListener("click", closeWarn);
      document
        .querySelector("#remove_other .removeother")
        .removeEventListener("click", clickRemoveOther);
    }

    //if remove other:
    function clickRemoveOther() {
      removePrefect(other);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
    popup.querySelector(".prefect").textContent = `Prefect:  ☆  not prefect`;
  }

  function makePrefect(student) {
    student.prefect = true;
    popup.querySelector(".prefect").textContent = `Prefect:  ★  is prefect`;
  }
}

/// ----> NUMBERS

function countGryffindors(student) {
  if (student.house === "Gryffindor") {
    return true;
  } else {
    return false;
  }
}
function countHufflepuffs(student) {
  if (student.house === "Hufflepuff") {
    return true;
  } else {
    return false;
  }
}
function countRavenclaws(student) {
  if (student.house === "Ravenclaw") {
    return true;
  } else {
    return false;
  }
}
function countSlytherins(student) {
  if (student.house === "Slytherin") {
    return true;
  } else {
    return false;
  }
}

function displayNumbers(students) {
  // displayed students
  document.querySelector(
    "#nr_displayed"
  ).textContent = `Displayed students : ${students.length}`;
  // avtive students
  document.querySelector(
    "#nr_all"
  ).textContent = `Active students : ${allStudents.length}`;
  // expelled students
  document.querySelector(
    "#nr_expelled"
  ).textContent = `Expelled students : ${expelledStudents.length}`;
  //houses
  document.querySelector("#nr_gryf").textContent = `Gryffindor: ${
    allStudents.filter(countGryffindors).length
  }`;
  document.querySelector("#nr_huff").textContent = `Hufflepuff: ${
    allStudents.filter(countHufflepuffs).length
  }`;
  document.querySelector("#nr_rav").textContent = `Ravenclaw: ${
    allStudents.filter(countRavenclaws).length
  }`;
  document.querySelector("#nr_slyt").textContent = `Slytherin: ${
    allStudents.filter(countSlytherins).length
  }`;
}

// cleaning the data

function getStudentsName(fullName) {
  if (fullName.includes(" ") == true) {
    const first = fullName.slice(0, fullName.indexOf(" "));
    const firstName = clean(first);
    return firstName;
  } else {
    const firstName = clean(fullName);
    return firstName;
  }
}

function getStudentsLastName(fullName) {
  const last = fullName.slice(fullName.lastIndexOf(" ") + 1);
  const lastName = clean(last);
  return lastName;
}

function getStudentsMiddleName(fullName) {
  if (fullName.includes(" ") == true) {
    const middleSpace = fullName.slice(
      fullName.indexOf(" ") + 1,
      fullName.lastIndexOf(" ")
    );
    const firstCharacter = middleSpace.slice(0, 1);
    if (firstCharacter !== '"') {
      const cleanMiddleName = clean(middleSpace);
      return cleanMiddleName;
    }
    if (fullName.includes(undefined) == true) {
    }
  }
}
function getHouse(dataHouse) {
  const house = clean(dataHouse);
  return house;
}

function getStudentsNickname(fullName) {
  const middleSpace = fullName.slice(
    fullName.indexOf(" ") + 1,
    fullName.lastIndexOf(" ")
  );
  const firstCharacter = middleSpace.slice(0, 1);
  if (firstCharacter === '"') {
    length = middleSpace.length;
    const nickNameWithoutQuotes = middleSpace.slice(1, length - 1);
    // console.log(nickNameWithoutQuotes);
    const cleanNickName = clean(nickNameWithoutQuotes);
    return cleanNickName;
  }
}

function getImage(lastname, firstname) {
  // lastname_firstletteroffirstname.png

  if (lastname !== undefined) {
    const smallLastName = lastname.toLowerCase();
    const smallFirstName = firstname.toLowerCase();
    const firstLetterOfFirstName = firstname.slice(0, 1).toLowerCase();
    if (lastname == "Patil") {
      const imageSrc = `${smallLastName}_${smallFirstName}.png`;
      return imageSrc;
    } else if (lastname.includes("-") == true) {
      const partOfLastNameAfterHyphen = lastname.slice(
        lastname.indexOf("-") + 1
      );
      const imageSrc = `${partOfLastNameAfterHyphen}_${firstLetterOfFirstName}.png`;
      return imageSrc;
    } else {
      const imageSrc = `${smallLastName}_${firstLetterOfFirstName}.png`;
      return imageSrc;
    }
  }
}

function clean(name) {
  const firstLetter = name.slice(0, 1).toUpperCase();
  const restOfName = name.slice(1).toLowerCase();
  const cleanName = firstLetter + restOfName;
  return cleanName;
}

//hacking the list (hedwig)
function hackTheSystem() {
  if (!settings.hacked) {
    console.log("Hoo Hoo! The system is hacked!");
    settings.hacked = true;

    // random blood type
    messWithBloodstatus();

    //Add myself as student
    addMe();
  } else {
    console.log("uups.. System's allready been hacked!");
  }
}

//Add me to list
function addMe() {
  const me = Object.create(Student);

  me.imageUrl = "";
  me.firstName = "Carolyne";
  me.lastName = "Green";
  me.middleName = "Huynh";
  me.nickname = "";
  me.gender = "Female";
  me.house = "Hufflepuff";
  me.bloodstatus = "pure";
  me.prefect = false;
  me.squad = false;
  me.expel = false;

  allStudents.unshift(me);
  buildList();
}

function messWithBloodstatus() {
  allStudents.forEach((student) => {
    if (student.bloodstatus === "muggleborm") {
      student.bloodstatus = "pure-blood";
    } else if (student.bloodstatus === "half-blood") {
      student.bloodstatus = "pure-blood";
    } else {
      let bloodNumber = Math.floor(Math.random() * 3);
      if (bloodNumber === 0) {
        student.bloodstatus = "muggleborn";
      } else if (bloodNumber === 1) {
        student.bloodstatus = "half-blood";
      } else {
        student.bloodstatus = "pure-blood";
      }
    }
  });
}
