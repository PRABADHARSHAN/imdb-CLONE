// select elements from the DOM
const searchButton = document.querySelector('#search');
const inputElement = document.querySelector('#inputValue');
const movieSearchable = document.querySelector('#movies-searchable');
const moviesContainer = document.querySelector('#movies-container');
var modal = document.getElementById("myModal");

const movieClick = (event) => {
  const target = event.target;
  //console.log('hello');
  //console.log(event);
  const movieId = target.dataset.movieId;
  const imdbID = target.dataset.imdbID;
  //console.log(target);
  //console.log(movieId);
  const section = event.target.parentElement; //section
  //console.log(section);
  const content = section.nextElementSibling; //content
  //content.classList.add('content-display');
  const path = `/movie/${movieId}/videos`;
  const url = generateUrl(path);
  $.ajax({
    method: "GET",
    url: url,
    success: (info) => {
      createVideoTemplate(info, content);
    },
    error: searchError
  })
  $.ajax({
    method: "GET",
    url: `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=37bdb8486fb959414ee9164606b9ea9a`,
    success: (info) => {
      const imdbID = info.imdb_id;

      $.ajax({
        method: "GET",
        url: `https://www.omdbapi.com/?i=${imdbID}&apikey=91abbf4a`,
        success: (info) => {
          //console.log(info);
          const poster = info.Poster;

          for (key in info) {
            //console.log(key, info[key]);
            if (document.getElementsByClassName(key).length > 0) {
              document.getElementsByClassName(key)[0].textContent = info[key];
            }
          }
          const movieLink = document.getElementById('movie-link');
          movieLink.setAttribute('href', `https://imdb.com/title/${imdbID}`);
          const posterDiv = document.getElementById('modal-poster');
          posterDiv.setAttribute('src', poster);

        },

      })

    },

  })
  $.ajax({
    method: "GET",
    url: `https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=37bdb8486fb959414ee9164606b9ea9a`,
    success: (info) => {
      const reviewLink = document.getElementById('reviewBtn');
      if (info.results > 0) {
        const review = info.results[0].url;
        reviewLink.setAttribute('href', review);
      } else {
        // $('#reviewBtn').hide();
        // reviewLink.style.display = 'none';
        reviewLink.textContent = 'No Reviews Avaliable';
        reviewLink.setAttribute('href', "javascript: void(0)");
        reviewLink.removeAttribute('target');
        reviewLink.classList.add('disabled')
      }

    }
  });
  if (target.id === 'content-close') {
    const content = target.parentElement;
    content.classList.remove('content-display');
  }

}

searchButton.addEventListener('click', (e) => {
  e.preventDefault();
  const value = inputElement.value;
  const errorMsg = document.querySelector('.error');
  if (value === '') {
    inputElement.classList.add('invalid');
    errorMsg.style.display = 'block';
    return
  }

  searchMovie(value);
  inputElement.value = '';
  //console.log(`value: ${value}`);
})


inputElement.addEventListener('change', (e) => {
  const errorMsg = document.querySelector('.error');
  errorMsg.style.display = 'none';
  inputElement.classList.remove('invalid');
})

function movieSection(movies) {
  const section = document.createElement('section');
  section.classList = 'section';
  movies.map((movie) => {
    if (movie.poster_path) {
      const img = document.createElement('img');
      img.addEventListener('click', movieClick);
      // img.onclick = function () {
      //   modal.style.display = "block";
      // }
      img.src = IMAGE_URL + movie.poster_path;
      //img['data-movie-id'] = IMAGE_URL + movie.poster_path;
      img.setAttribute('data-movie-id', movie.id);
      section.appendChild(img);
    }
  });
  return section;
}

function createMovieContainer(movies, header) {
  //console.log(movies);
  const movieElement = document.createElement('div');
  movieElement.setAttribute('class', 'movie');
  const content = document.createElement('div');
  content.classList = 'content';
  const title = document.createElement('h1');
  title.innerHTML = header;
  // const movieTemplate = `
  // <h1>${header}</h1>
  // <section class="section">
  //   ${movieSection(movies)}
  // </section>
  // <div class ="content">
  // </div>
  //   `;
  const section = movieSection(movies);
  movieElement.appendChild(title);
  movieElement.appendChild(section);
  movieElement.appendChild(content);
  // movieElement.innerHTML = movieTemplate;
  return movieElement;
}

function renderSearchMovies(data) {
  movieSearchable.innerHTML = '';
  const movies = data.results;
  const movieBlock = createMovieContainer(movies, 'Search Results');
  movieSearchable.appendChild(movieBlock);
}

function renderMovies(data, header) {
  const movies = data.results;
  const movieBlock = createMovieContainer(movies, header);
  moviesContainer.appendChild(movieBlock);
}

function searchSuccess(data) {
  console.log("Success:", data);
}

function searchError(error) {
  console.log("Error:", error);
  $('.ajaxProgress').hide();
  const spanError = document.getElementById('error');
  spanError.textContent = `Sorry Something's Wrong We're working on it! ${error.statusText}`;
  spanError.style.display = 'block'
}

function createVideoTemplate(info, content) {
  //content.innerHTML ='<p id="content-close">X</p>';
  const modalMovie = document.getElementById('modal-movie-info');
  modalMovie.innerHTML = '';
  const videos = info.results;
  const length = videos.length > 4 ? 4 : videos.length;
  const iframeContainer = document.createElement('div');
  iframeContainer.innerHTML = '<h2><strong>Trailer:</strong></h2>'
  for (let i = 0; i < length; i++) {
      const video = videos[i]; // video
      const iframe = createIframe(video);
      iframeContainer.appendChild(iframe);
      modalMovie.appendChild(iframeContainer);
    }

  modal.style.display = 'block'
}

function createIframe(video) {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${video.key}`;
  //console.log(iframe.src);
  iframe.width = 360;
  iframe.height = 315;
  iframe.allowFullscreen = true;

  return iframe;
}

getUpcomingMovies();
// getLatestMovies();
getTopRatedMovies();
getNowPlayingMovies();
getPopularMovies();


