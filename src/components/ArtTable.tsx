// React imports
import { useState, useEffect, useRef } from "react";

// PrimeReact imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { OverlayPanel } from "primereact/overlaypanel";
import axios from "axios";

export const ArtTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRows, setSelectedRows] = useState<any[]>(() => {
    const stored = localStorage.getItem("selectedRows");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectCount, setSelectCount] = useState<number>(() => {
    const stored = localStorage.getItem("remainingToSelect");
    return stored ? parseInt(stored) : 0;
  });

  const overlayRef = useRef<OverlayPanel>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalPages = 10770;

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("selectedRows", JSON.stringify(selectedRows));
  }, [selectedRows]);

  useEffect(() => {
    localStorage.setItem("remainingToSelect", selectCount.toString());
  }, [selectCount]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const fetched = response.data.data;

      // Auto select rows if selectCount > 0
      let updatedRows = [...selectedRows];
      if (selectCount > 0) {
        const alreadySelectedIds = new Set(updatedRows.map((row) => row.id));
        const toSelect = fetched
          .filter((row: any) => !alreadySelectedIds.has(row.id))
          .slice(0, selectCount);
        updatedRows = [...updatedRows, ...toSelect];
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

  const selectionHeaderTemplate = () => {
    return (
      <div className="flex items-center gap-2">
        <Button
          icon="pi pi-chevron-down"
          className="p-button-text bg-white"
          style={{ fontSize: "0.75rem", width: "1.5rem", height: "1.5rem" }}
          onClick={(e) => overlayRef.current?.toggle(e)}
        />
        <OverlayPanel ref={overlayRef}>
          <input
            ref={inputRef}
            placeholder="Select rows..."
            className="border px-2 py-1 rounded w-full mb-2"
            type="number"
            min="1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputRef.current?.value) {
                const val = parseInt(inputRef.current.value);
                if (val > 0) {
                  const alreadySelectedIds = new Set(
                    selectedRows.map((row) => row.id)
                  );
                  const toSelect = data
                    .filter((row) => !alreadySelectedIds.has(row.id))
                    .slice(0, val);
                  const updated = [...selectedRows, ...toSelect];
                  setSelectedRows(updated);
                  setSelectCount(Math.max(0, val - toSelect.length));
                  inputRef.current.value = "";
                  overlayRef.current?.hide();
                }
              }
            }}
          />
          <Button
            label="submit"
            onClick={() => {
              if (inputRef.current?.value) {
                const val = parseInt(inputRef.current.value);
                if (val > 0) {
                  const alreadySelectedIds = new Set(
                    selectedRows.map((row) => row.id)
                  );
                  const toSelect = data
                    .filter((row) => !alreadySelectedIds.has(row.id))
                    .slice(0, val);
                  const updated = [...selectedRows, ...toSelect];
                  setSelectedRows(updated);
                  setSelectCount(Math.max(0, val - toSelect.length));
                  inputRef.current.value = "";
                  overlayRef.current?.hide();
                }
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
