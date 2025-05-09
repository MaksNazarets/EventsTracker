"use client";

import { EventType, Importance } from "@/types";
import dayjs from "dayjs";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CreateEventDialog from "../CreateEventDialog";
import API from "@/utils/api";
import DayEvent from "../DayEvent";
import EventViewer from "../EventViewer";
import LoadingSpinner from "../LoadingSpinner";

interface Props {
  date: dayjs.Dayjs | null;
  onClose: () => void;
}

function DayEventsInfo({ date, onClose }: Props) {
  const [filter, setFilter] = useState<"all" | Importance>("all");
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [dayEvents, setDayEvents] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [eventToView, setEventToView] = useState<EventType | null>(null);

  useEffect(() => {
    if (filter === "all") setFilteredEvents(dayEvents);
    else setFilteredEvents(dayEvents.filter((e) => e.importance === filter));
  }, [filter, dayEvents]);

  useEffect(() => {
    if (!date) return;

    document.addEventListener("keydown", handleEscKeyPress);

    setIsDataFetching(true);
    API.get(`/events/get?date=${date}`, {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((res: any) => {
        setDayEvents(res.data.events);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsDataFetching(false);
      });

    return () => {
      document.removeEventListener("keydown", handleEscKeyPress);
    };
  }, [date]);

  const close = () => {
    onClose();
    setDayEvents([]);
    setFilter("all");
  };

  const handleEscKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };

  const handleCreateEvent = useCallback((event: EventType) => {
    setDayEvents((prev) =>
      [...prev, event].toSorted(
        (a, b) =>
          new Date(a.dateTime!).getTime() - new Date(b.dateTime!).getTime()
      )
    );
  }, []);

  const filtered = useMemo(
    () =>
      filteredEvents.map((e) => (
        <DayEvent key={e.id} event={e} onClick={() => setEventToView(e)} />
      )),
    [filteredEvents]
  );

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen flex flex-col w-md px-4 border-r border-gray-600 bg-gray-900 transition z-30 ${
          date ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <X
          className="absolute top-5 right-2 hover:text-gray-400"
          width={30}
          height={30}
          onClick={() => close()}
        />

        <h3 className="text-3xl text-center mx-2 mt-4 mb-8">
          {date?.format("MMMM D, YYYY")}
        </h3>
        <div className="h-[300px] flex-1 flex flex-col pb-2">
          <div className="flex justify-between gap-3">
            <button
              className="text-2xl px-3 py-1 border border-gray-300 rounded-md hover:border-white hover:bg-gray-800 active:brightness-90"
              onClick={() => setIsAddEventDialogOpen(true)}
            >
              Create event
            </button>
            <select
              value={filter}
              className=" text-2xl px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              onChange={(e) => {
                e.target.value === "all"
                  ? setFilter("all")
                  : setFilter(parseInt(e.target.value, 10) as Importance);
              }}
            >
              <option value="all">all</option>
              <option value={1}>ordinary</option>
              <option value={2}>important</option>
              <option value={3}>critical</option>
            </select>
          </div>
          <h2 className="text-2xl text-center font-bold mb-1 mt-3">Events</h2>
          <div className="flex-1 max-h-full overflow-auto mt-3 pr-1">
            <ul className="ul">{filtered}</ul>
            {!filteredEvents.length && !isDataFetching && (
              <div className="text-xl text-center text-gray-500 my-10">
                No events for this day...
              </div>
            )}
            {isDataFetching && (
              <div className="flex justify-center my-10">
                <LoadingSpinner />
              </div>
            )}{" "}
          </div>
        </div>
      </div>
      {date && (
        <div
          className="fixed w-screen h-screen bg-black/25 z-10"
          onClick={() => close()}
        ></div>
      )}
      <CreateEventDialog
        isOpen={isAddEventDialogOpen}
        onClose={() => setIsAddEventDialogOpen(false)}
        onSuccess={handleCreateEvent}
      />
      {eventToView && (
        <EventViewer
          event={eventToView}
          isOpen={eventToView !== null}
          onClose={() => setEventToView(null)}
          onUpdate={(event: EventType) =>
            setDayEvents((prev) =>
              prev
                .map((e) => (e.id === event.id ? event : e))
                .toSorted(
                  (a, b) =>
                    new Date(a.dateTime!).getTime() -
                    new Date(b.dateTime!).getTime()
                )
            )
          }
          onDelete={() =>
            setDayEvents((prev) => prev.filter((e) => e.id !== eventToView.id))
          }
        />
      )}
    </>
  );
}

export default DayEventsInfo;
