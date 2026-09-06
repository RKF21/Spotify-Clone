let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

async function getSongs(folder) {
  currFolder = folder;

  // folder looks like "songs/Arijit Singh" — extract just "Arijit Singh"
  let folderName = folder.split("/").slice(-1)[0];

  // fetch the JSON file that sits directly inside songs/, named after the artist
  let a = await fetch(`/songs/${folderName}.json`);
  songs = await a.json();

  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li> 
           <img class="invert" src="Images/music.svg" alt="music">
                      <div class="info">
                        <div> ${song.replaceAll("%20", " ")}</div>
                        <div >RKF</div>
                      </div>
                      <div class="playnow">
                        <span>Play now</span>
                        <img class="invert" src="Images/play.svg" alt="">
                      </div>
          </li>`
  }

  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })
  })
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track
  if (!pause) {
    currentSong.play()
    playnow.src = "Images/pause_music.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
  let a = await fetch(`/songs/albums.json`);
  let folders = await a.json();

  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (let folder of folders) {
    let a = await fetch(`/songs/${folder}/info.json`);
    let response = await a.json();

    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"
                                    text-rendering="geometricPrecision" image-rendering="optimizeQuality"
                                    fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 512">
                                    <circle fill="#01A437" cx="256" cy="256" r="256" />
                                    <path fill="#42C76E"
                                        d="M256 9.28c136.12 0 246.46 110.35 246.46 246.46 0 3.22-.08 6.42-.21 9.62C497.2 133.7 388.89 28.51 256 28.51S14.8 133.7 9.75 265.36c-.13-3.2-.21-6.4-.21-9.62C9.54 119.63 119.88 9.28 256 9.28z" />
                                    <path fill="#050505"
                                        d="M351.74 275.46c17.09-11.03 17.04-23.32 0-33.09l-133.52-97.7c-13.92-8.73-28.44-3.6-28.05 14.57l.54 191.94c1.2 19.71 12.44 25.12 29.04 16l131.99-91.72z" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
  }

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])
    })
  })
}

async function main() {

  await getSongs("songs/Arijit Singh")   // 👈 replace with your real default artist folder name if different
  playMusic(songs[0], true)

  displayAlbums()

  playnow.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      playnow.src = "Images/pause_music.svg"
    }
    else {
      currentSong.pause()
      playnow.src = "Images/play.svg"
    }
  })

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
  })

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  })

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  })

  previous.addEventListener("click", () => {
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
  })

  next.addEventListener("click", () => {
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
    if ((index + 1) < (songs.length)) {
      playMusic(songs[index + 1])
    }
  })

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
      document.querySelector(".volume> img").src = document.querySelector(".volume> img").src.replace("Images/mute.svg", "Images/volume.svg")
    }
  })

  document.querySelector(".volume> img").addEventListener("click", e => {
    if (e.target.src.includes("Images/volume.svg")) {
      e.target.src = e.target.src.replace("Images/volume.svg", "Images/mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else {
      e.target.src = e.target.src.replace("Images/mute.svg", "Images/volume.svg")
      currentSong.volume = 0.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10
    }
  })

}
main()