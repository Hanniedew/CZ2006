import React from "react";

import secondaryCutOff from "../../../JSON/secondary_cut_off.json"; /* CutOffPoints */
import ReactPaginate from "react-paginate";
import { useState } from "react";
import Dropdown from "../../../Components/Dropdown";
import SideDrawer from "../../../Components/SideDrawer";
import CutOffCard from "../../../Components/CutOffCard";
import data from "../../../JSON/combined_data.json"; // COMBINED DATASET OF EVERYTHING WE NEED

import "../../../ComponentsCSS/PaginationButtons.css";
import "../../../ComponentsCSS/SchoolsCard.css";
import "../../../ComponentsCSS/SchoolSearchBar.css";

import { SchoolsContext } from "../../../Contexts/SchoolsContext";
import { useContext } from "react";

function SecondaryCutOff() {
  const [pageNumber, setPageNumber] = useState(0);
  const schoolsPerPage = 20;
  const noOfSchoolsVisited = pageNumber * schoolsPerPage;
  const [searchTerm, setSearchTerm] = useState("");

  const { schoolsContext } = useContext(SchoolsContext);
  //let data = schoolsContext.schools;

  /* extract the data we want */
  let schools = [];

  if (data !== undefined) {
    // filter to get primary school data
    let index = 0; // to ensure the school appear in numeric order, using i will skip some numbers
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].mainlevel_code === "SECONDARY" ||
        data[i].mainlevel_code === "MIXED LEVELS"
      ) {
        schools[index++] = data[i];
      }
    }
  }

  const displaySchools = schools
    .slice(noOfSchoolsVisited, noOfSchoolsVisited + schoolsPerPage)
    .map((school) => (
      <div key={school._id}>
        <CutOffCard data={school} level={"Secondary"} />
      </div>
    ));

  const searchSchools = schools
    .filter((value) => {
      if (searchTerm === "") return value;
      else if (
        value.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (value.express !== undefined &&
          value.express.toString().includes(searchTerm)) || // Numbers
        (value.na !== undefined && value.na.toString().includes(searchTerm)) || // Numbers
        (value.nt !== undefined && value.nt.toString().includes(searchTerm)) // Numbers
      ) {
        return value;
      }
    })
    .map((school) => (
      <div key={school.school_name}>
        <CutOffCard data={school} level={"Secondary"} />
      </div>
    ));

  // Determine number of pages
  const pageCount = Math.ceil(secondaryCutOff.length / schoolsPerPage);

  const handlePageClick = (event) => {
    setPageNumber(event.selected);
    window.scrollTo(0, 0);
  };

  return searchTerm !== "" ? (
    <>
      <SideDrawer level="Secondary" />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Dropdown currentPage={"Secondary"} />
        <input
          className="search-bar"
          type="text"
          placeholder="Type to Search..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "70%",
          margin: "auto",
          marginBottom: "1rem",
        }}
      >
        <div className="school-level-title">Secondary Schools </div>
      </div>

      {searchSchools}
    </>
  ) : (
    <>
      <SideDrawer level="Secondary" />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Dropdown currentPage={"Secondary"} />
        <input
          className="search-bar"
          type="text"
          placeholder="Type to Search..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "70%",
          margin: "auto",
          marginBottom: "1rem",
        }}
      >
        <div className="school-level-title">Secondary Schools </div>
      </div>

      {displaySchools}
      <ReactPaginate
        previousLabel="<"
        nextLabel=">"
        breakLabel="..."
        pageCount={pageCount}
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        marginPagesDisplayed={8}
        renderOnZeroPageCount={null}
        containerClassName={"paginationButtons"}
        previousLinkClassName={"previousButtons"}
        nextLinkClassName={"nextButtons"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
      />
    </>
  );
}

export default SecondaryCutOff;
