import banner1 from '../assets/banner02.png';
import banner2 from '../assets/firma.gif';
import banner3 from '../assets/Logo Global.png';

const Carrusel = () => {
  return (
    <div className="container2">
    <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src={banner1} className="d-block w-100" alt="..." width={"100%"} />
        </div>
        <div className="carousel-item">
          <img src={banner3} className="d-block w-100" alt="..." width={"100%"} />
        </div>
        <div className="carousel-item">
          <img src={banner2} className="d-block w-100" alt="..." width={"100%"} />
        </div>
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
    </div>
  );
}

export default Carrusel;
