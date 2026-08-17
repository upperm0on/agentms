import '../../assets/css/landingpage/RoomCard.css';

function RoomCards({background_image, number_in_room}) {
    return(
        <div className="card">
            <div className="card-background">
                <img src={background_image} alt="card-background" />
            </div>
            <p className="card-text">{number_in_room} in a room</p>
            <button className="card-button">
                See More
            </button>
        </div>
    );
}

export default RoomCards