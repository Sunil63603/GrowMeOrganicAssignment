//prime-react imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";

//temporary empty data just to avoid error when rendering.
const dummyData: any[] = [];

export const ArtTable = () => {
  //Just for illustration, actual state/data will be added later.
  //First column:checkbox + chevron
  const selectionHeaderTemplate = () => {
    return (
      //❌i think 'gap' should be reduced.
      <div className="flex items-center gap-2">
        {/*Header Checkbox (select all 12 rows in currentPage)*/}
        <Checkbox
          //will be controlled in future.
          onChange={() => {}}
          checked={false} //not selected for now
        />

        {/* Chevron-down icon opens overlay(to be implemented)*/}
        <Button
          icon="pi pi-chevron-down" //PrimeIcons built-in chevron icon
          className="p-button-text bg-white"
          style={{ fontSize: "0.75rem", width: "1.5rem", height: "1.5rem" }} //smaller icon
          onClick={() => {}} //will attach overlay logic later
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      <DataTable value={dummyData}>
        {/* ❌First column:selection checkbox+overlay chevron */}
        <Column
          body={() => <Checkbox onChange={() => {}} checked={false} />}
          header={selectionHeaderTemplate} //custom header with checkbox + chevron
          style={{ width: "4rem" }} //Fixed width for checkbox column
        />

        {/* Data Columns */}
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
    </div>
  );
};
