import { EventType } from "@/types";
import dayjs from "dayjs";
import { HTMLProps } from "react";

interface Props extends HTMLProps<HTMLLIElement> {
  event: EventType;
}

function MonthEvent({ event, ...props }: Props) {
  const dateObject = dayjs(event.dateTime || "");

  return (
    <li {...props}>
      <div
        className={`flex flex-col gap-1 w-full px-3 py-1 text-2xl mb-2 border border-gray-700 border-l-4 select-none hover:border-gray-600 rounded-md ${
          event.importance === 2
            ? "border-l-orange-400 hover:border-l-orange-500"
            : event.importance === 3
            ? "border-l-red-800 hover:border-l-red-700"
            : ""
        }`}
      >
        <div className="flex-1 text-left">
          <h3 className="overflow-hidden text-ellipsis">{event.title}</h3>
          <span>{dateObject.format("MMMM D, HH:mm")}</span>
        </div>
      </div>
    </li>
  );
}

export default MonthEvent;
