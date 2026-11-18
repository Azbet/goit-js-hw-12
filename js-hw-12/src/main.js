import axios from "axios";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector("#search-form");
const gallery = document.querySelector(".gallery");
const loader = document.querySelector(".loader");
const loadMoreBtn = document.querySelector(".load-more");

let lightbox = new SimpleLightbox(".gallery a", {
  captionsData: "alt",
  captionDelay: 250,
});

let searchQuery = "";
let page = 1;
const perPage = 40;

loadMoreBtn.style.display = "none";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    iziToast.warning({
      title: "Warning",
      message: "Please enter a search query!",
      position: "topRight",
    });
    return;
  }

  gallery.innerHTML = "";
  page = 1;
  loadMoreBtn.style.display = "none";
  loader.style.display = "grid";

  try {
    const data = await fetchImages(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        title: "Error",
        message: "Sorry, there are no images matching <br> your search query. Please try again!",
        position: "topRight",
      });
      return;
    }

    renderGallery(data.hits);
    lightbox.refresh();

    if (page * perPage < data.totalHits) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
      iziToast.info({
        title: "Info",
        message: "We're sorry, but you've reached the end of search results.",
        position: "topRight",
      });
    }

  } catch (error) {
    console.error("Hata detayı:", error);
    iziToast.error({
      title: "Error",
      message: "Something went wrong! Please try again later.",
      position: "topRight",
    });
  } finally {
    loader.style.display = "none";
  }
});

loadMoreBtn.addEventListener("click", async () => {
  page += 1;
  loadMoreBtn.style.display = "none";
  loader.style.display = "grid";

  try {
    const data = await fetchImages(searchQuery, page);

    renderGallery(data.hits);
    lightbox.refresh();

    const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: "smooth",
    });

    if (page * perPage >= data.totalHits) {
      loadMoreBtn.style.display = "none";
      iziToast.info({
        title: "Info",
        message: "We're sorry, but you've reached the end of search results.",
        position: "topRight",
      });
    } else {
      loadMoreBtn.style.display = "block";
    }

  } catch (error) {
    console.error("Hata detayı:", error);
    iziToast.error({
      title: "Error",
      message: "Something went wrong! Please try again later.",
      position: "topRight",
    });
  } finally {
    loader.style.display = "none";
  }
});

async function fetchImages(query, currentPage) {
  const API_KEY = "21500609-1dbb9b63fb14df1cafdda29de";
  const BASE_URL = "https://pixabay.com/api/";

  const response = await axios.get(BASE_URL, {
    params: {
      key: API_KEY,
      q: query,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: "true",
      page: currentPage,
      per_page: perPage,
    },
  });

  return response.data;
}

function renderGallery(images) {
  const markup = images
    .map(
      (image) => `
    <li class="gallery-item">
      <a class="gallery-link" href="${image.largeImageURL}">
        <img class="gallery-image" src="${image.webformatURL}" alt="${image.tags}" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          <span>${image.likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b>
          <span>${image.views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b>
          <span>${image.comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b>
          <span>${image.downloads}</span>
        </p>
      </div>
    </li>
  `,
    )
    .join("");

  gallery.insertAdjacentHTML("beforeend", markup);
}