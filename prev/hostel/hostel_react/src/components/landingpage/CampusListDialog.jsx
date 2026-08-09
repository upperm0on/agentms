import '../../assets/css/landingpage/CampusListDialog.css';


// Component for displaying filtered campus list
function CampusListDialog({ campusList, filterText, onSelect }) {
  // Filter campuses based on input text
  const filteredCampuses = campusList
    ? campusList.filter((campus) =>
        campus.campus.toLowerCase().includes(filterText.toLowerCase())
      )
    : [];

  return (
    <div className="campus_list_dialog">
      {filteredCampuses.length > 0 ? (
        <ul className="campus_list">
          {filteredCampuses.map((campus) => (
            <li
              key={campus.id}
              className="campus_list_item"
              onClick={() => onSelect(campus)}
            >
              {campus.campus}
            </li> 
          ))}
        </ul>
      ) : (
        <div className="no_results">No matching campuses found</div>
      )}
    </div>
  );
}

export default CampusListDialog;