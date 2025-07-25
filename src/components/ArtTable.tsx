// React imports
import { useState, useEffect, useRef } from "react";

// PrimeReact imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { OverlayPanel } from "primereact/overlaypanel";

//axios for side-effects
import axios from "axios";

export const ArtTable = () => {
  //state variables👇
  const [data, setData] = useState<any[]>([]); //stores all 12 rows of currentPage.
  const [loading, setLoading] = useState<boolean>(false); //to display message, when fetching data from API.

  //to keep track of currentPage number
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const stored = localStorage.getItem("currentPage"); //to persist hard page reload.
    return stored ? parseInt(stored) : 1; //default is 1st page.
  });

  //DataTable checkbox works better with "selectedRows" than with "selectedIds".
  //i tried storing only id's but that didnt work with checkbox blue ticks.
  const [selectedRows, setSelectedRows] = useState<any[]>(() => {
    const stored = localStorage.getItem("selectedRows"); //for persisting page change and reload.
    return stored ? JSON.parse(stored) : [];
  });

  //When user enters rowsNumber(>12), i will first select all rows of currentPage and remember "remaining row count to be selected".
  //then when user goes to nextPage, i am dynamically filling checkboxes.
  //This is best for performance
  const [selectCount, setSelectCount] = useState<number>(() => {
    const stored = localStorage.getItem("remainingToSelect");
    return stored ? parseInt(stored) : 0;
  });

  //Ref variables👇
  //to point to modal which opens on "Chevron-down" icon click
  const overlayRef = useRef<OverlayPanel>(null);

  //to maintain reference of "selectedRow" number.
  const inputRef = useRef<HTMLInputElement | null>(null);

  //Normal variable
  //For this assignment, i have hardcoded this.
  //But response.data.pagination.total_pages will give me this value.
  const totalPages = 10770;

  //variables in localStorage👇
  //fetch data when pageNumber changes
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  //store selectedRows in localStorage.
  useEffect(() => {
    localStorage.setItem("selectedRows", JSON.stringify(selectedRows));
  }, [selectedRows]);

  //this approach is best for performance👇
  useEffect(() => {
    localStorage.setItem("remainingToSelect", selectCount.toString());
  }, [selectCount]);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  //functions👇
  //asynchronous func that takes pageNumber as an argument.
  const fetchData = async (page: number) => {
    try {
      setLoading(true); //show message to user.
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );

      //extracting data[] from API response, which contains artworks for currentPage
      const fetched = response.data.data;

      //Create a copy of currently selected rows(to avoid mutating state directly)
      let updatedRows = [...selectedRows];

      //if there are still rows left to select
      if (selectCount > 0) {
        //creating a "unique" set of IDs for rows that are already selected, for quick lookup and to avoid duplicates.
        const alreadySelectedIds = new Set(updatedRows.map((row) => row.id));

        //from newly fetched data, filter out rows that are already selected.
        //then take up to 'selectCount' more rows to select.
        const toSelect = fetched
          .filter((row: any) => !alreadySelectedIds.has(row.id)) //filter out rows that are already selected
          .slice(0, selectCount);

        //Add newly selected rows to the updatedRows array
        updatedRows = [...updatedRows, ...toSelect];

        //decrease the selectCount by the number of rows just selected,
        //but never let it go below zero
        setSelectCount((prev) => Math.max(0, prev - toSelect.length));
      }

      setData(fetched);
      setSelectedRows(updatedRows);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (e: any) => {
    setCurrentPage(e.page + 1);
  };

  const handleBulkRowSelection = (
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    if (!inputRef.current) return;
    const val = parseInt(inputRef.current.value); //converting string to number
    if (val > 0) {
      const alreadySelectedIds = new Set(selectedRows.map((row) => row.id)); //unique(Set) list of previously selectedRows(already existing).

      //to quick check if a row is already selected and avoid duplicates
      const toSelect = data
        .filter((row) => !alreadySelectedIds.has(row.id))
        .slice(0, val); //filter out rows that are already selected

      //combine the old selected rows with the new ones to get the updated selection
      const updated = [...selectedRows, ...toSelect];

      setSelectedRows(updated);

      //if user asked for more than 12 rows,
      //remember how many are left to select for next page
      setSelectCount(Math.max(0, val - toSelect.length)); //never let this number go below zero

      inputRef.current.value = "";
      overlayRef.current?.hide();
    }
  };

  //logic for first column in header(ie, checkbox and chevron-down)
  const selectionHeaderTemplate = () => {
    return (
      <div className="flex items-center gap-2">
        {/* chevron button to open the overlay for bulk selection */}
        <Button
          icon="pi pi-chevron-down"
          className="p-button-text bg-white"
          style={{ fontSize: "0.75rem", width: "1.5rem", height: "1.5rem" }}
          onClick={(e) => overlayRef.current?.toggle(e)} //overlay-modal display will toggle based on click event.
        />

        {/* Modal that appears when chevron is clicked, for entering number of rows to select */}
        <OverlayPanel ref={overlayRef}>
          <input
            ref={inputRef}
            placeholder="Select rows..."
            className="border px-2 py-1 rounded w-full mb-2"
            type="number"
            min="1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputRef.current?.value) {
                handleBulkRowSelection(inputRef);
              }
            }}
          />
          <Button
            label="submit"
            onClick={() => {
              if (inputRef.current?.value) {
                handleBulkRowSelection(inputRef);
              }
            }}
          />
        </OverlayPanel>
      </div>
    );
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-4 rounded shadow">
            API is being called, data is loading from server.
          </div>
        </div>
      )}

      <DataTable
        value={data}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        dataKey="id"
        emptyMessage="No available data"
      >
        <Column
          selectionMode="multiple"
          header={selectionHeaderTemplate}
          headerStyle={{ width: "4rem" }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      <div className="mt-4 w-full max-w-xl mx-auto">
        <Paginator
          first={(currentPage - 1) * 12}
          rows={12}
          totalRecords={totalPages * 12}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
