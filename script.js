const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const USER_PER_PAGE = 12

const userPanel = document.querySelector("#user-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")

const friends = []
let filterFriends = []

const closeFriends = JSON.parse(localStorage.getItem("closeFriends")) || []

////功能2: 加入摯友清單
function addToCloseFriend(id) {
  if (closeFriends.some((friend) => friend.id === id)) {
    return alert("這名好友已經在摯友清單囉!\n想他的話連絡一下他吧")
  }
  const addCloseFriend = friends.find((friend) => friend.id === id)
  closeFriends.push(addCloseFriend)
  localStorage.setItem("closeFriends", JSON.stringify(closeFriends))
}

////功能3: 改善使用者體驗:分頁功能
function getFriendsPerPage(page) {
  let startIndex = (page - 1) * USER_PER_PAGE
  let endIndex = startIndex + USER_PER_PAGE
  let data = filterFriends.length ? filterFriends : friends
  return data.slice(startIndex, endIndex)
}

function renderPagination(amount) {
  const pages = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = `<li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>`
  for (let page = 2; page <= pages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function renderUserList(userArr) {
  let rawHTML = ""
  for (const user of userArr) {
    rawHTML += `        
      <div class="col-sm-2">
        <div class="mb-5">
          <div class="card">
            <img src="${user.avatar}" class="card-img-top user-image" data-id="${user.id}"alt="user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal">
            <div class="card-body">
              <h6 class="card-title ">${user.name} ${user.surname}</h6>
              <div class="button text-end align-item-end">
                <a href="#" class="btn btn-outline-danger mt-3 btn-sm add-close-friend" data-id="${user.id}"><i class="fa-solid fa-heart-circle-plus"></i> 加入摯友</a>                           
              </div>     
            </div>
          </div>  
        </div>     
      </div>`
  }
  userPanel.innerHTML = rawHTML
}

function showUserModal(id) {
  const modalUserName = document.querySelector("#modal-user-name")
  const modalUserAvatar = document.querySelector(".modal-user-avatar")
  const modalUserGender = document.querySelector(".modal-user-gender")
  const modalUserAge = document.querySelector(".modal-user-age")
  const modalUserBirthday = document.querySelector(".modal-user-birthday")
  const modalUserRegion = document.querySelector(".modal-user-region")
  const modalUserEmail = document.querySelector(".modal-user-email")

  //用id搜尋friends陣列，找到user id去發axios取得資料
  for (const user of friends) {
    if (user.id === id) {
      axios
        .get(INDEX_URL + String(id))
        .then((response) => {
          const getIDUser = response.data

          modalUserName.innerHTML = `<span><i class="fa-solid fa-user-astronaut"></i></span>${getIDUser.name} ${getIDUser.surname}`
          modalUserAvatar.innerHTML = `<img src="${getIDUser.avatar}" alt="modal-user-avatar"/>`
          modalUserGender.innerHTML = `<span><i class="fa-solid fa-venus-mars"></i></span>${
            "Gender: " + getIDUser.gender
          }`
          modalUserAge.innerHTML = `<span><i class="fa-solid fa-baby"></i></span>${
            "Age: " + getIDUser.age
          }`
          modalUserBirthday.innerHTML = `<span><i class="fa-solid fa-cake-candles"></i></span>${
            "Birthday: " + getIDUser.birthday
          }`

          modalUserRegion.innerHTML = `<span><i class="fa-solid fa-map-location-dot"></i></span>${
            "Region: " + getIDUser.region
          }`
          modalUserEmail.innerHTML = `<span><i class="fa-solid fa-paper-plane"></i></span>${getIDUser.email}`
        })
        .catch((error) => console.log(error))
    }
  }
}

userPanel.addEventListener("click", function onPanelClick(event) {
  const target = event.target
  if (target.matches(".user-image")) {
    showUserModal(Number(target.dataset.id))
  } else if (target.matches(".add-close-friend")) {
    addToCloseFriend(Number(target.dataset.id))
  }
})

////功能1: 新增搜尋功能
// 在search bar 表單掛上事件監聽器，偵測submit事件
searchForm.addEventListener("submit", function onSearchInputSubmitted(event) {
  event.preventDefault()
  let keyword = searchInput.value.trim().toLowerCase() //搜尋不分大小寫

  filterFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(keyword) ||
      friend.surname.toLowerCase().includes(keyword)
  ) //將名字裡面有我們輸入的關鍵字的人篩選出來裝到陣列裡面，並重新賦值到filterFriends

  //功能優化: 如果輸入無效的關鍵字，跳出提醒且不render空白畫面(不render空陣列)
  if (!filterFriends.length) {
    alert("Oops! 找不到這個人耶\n再試試別的關鍵字吧!")
    searchInput.value = " "
    return
  }
  //render搜尋結果
  renderPagination(filterFriends.length)
  renderUserList(getFriendsPerPage(1))
})

paginator.addEventListener("click", function onPaginatorClick(event) {
  const target = event.target
  if (target.tagName !== "A") return
  const pageIcon = target.parentElement
  const page = Number(target.dataset.page)

  const cleanActive = document.querySelector("#paginator .active")
  if (cleanActive) {
    cleanActive.classList.remove("active")
  }
  pageIcon.classList.add("active")

  renderUserList(getFriendsPerPage(page))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results)
    renderPagination(friends.length)
    renderUserList(getFriendsPerPage(1))
  })
  .catch((error) => console.log(error))
