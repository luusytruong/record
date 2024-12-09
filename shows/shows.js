//
let arr = []
//
function saveToStorage() {
    chrome.storage.local.set({ questions: arr }, function () {
        console.log('Array saved to storage:', arr);
    })
}
//
function loadToStorage() {
    chrome.storage.local.get(['questions'], function (result) {
        if (result.questions) {
            arr = result.questions
            load(arr)
        } else {
            alert('error');
        }
    })
}
//
let bC = document.getElementById('btn-clear')
bC.addEventListener('click', () => {
    document.querySelector('.form').classList.add('active')
})
let bN = document.getElementById('btn-no')
bN.addEventListener('click', () => {
    document.querySelector('.form').classList.add('animate')
    setTimeout(() => {
        document.querySelector('.form').classList.remove('active')
        document.querySelector('.form').classList.remove('animate')
    }, 600)
})
let bY = document.getElementById('btn-yes')
bY.addEventListener('click', () => {
    arr = []
    saveToStorage()
    loadToStorage()
    document.querySelector('.form').classList.add('animate')
    setTimeout(() => {
        document.querySelector('.form').classList.remove('active')
        document.querySelector('.form').classList.remove('animate')
    }, 600)
})
//
function load(arr) {
    let qC = document.getElementById('question-container')
    qC.innerText = ''
    arr.forEach((html, i) => {
        if (html != null) {
            let q = document.createElement('div')
            q.className = 'question'
            q.innerHTML = html
            qC.appendChild(q)
        }
    })
}
//
loadToStorage()