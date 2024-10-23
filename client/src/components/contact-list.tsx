import Contact from "@/components/contact";
import { RootState } from "@/store/store";
import { User } from "@/types";
import { useSelector } from "react-redux";

interface ContactListProps {
  contacts?: User[];
}

const ContactList = ({ contacts }: ContactListProps) => {
  const typingUsers = useSelector(
    (state: RootState) => state.typingStatus.typingUsers
  );

  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-slate-50/30 px-3 overflow-y-scroll flex-1  pb-4"
      id="contact-list"
    >
      {contacts.map((contact) => {
        let isTyping = false;
        let username: string;

        if (contact.type === "group") {
          isTyping = typingUsers[contact.id]?.length > 0;
          username = typingUsers[contact.id]?.[0]?.username || "";
        } else {
          const rooms = contact.rooms || [];
          isTyping = rooms.some((room) => typingUsers[room]?.length > 0);
          username = "";
        }

        return (
          <Contact
            key={contact.id}
            id={contact.id}
            name={
              contact.type === "group"
                ? contact.name || "Unknown Group"
                : `${contact.firstName} ${contact.lastName}`
            }
            image={contact.avatar?.url}
            type={contact.type || "user"}
            sentShortMsg={contact.lastMessage}
            typingStatus={isTyping}
            userTypingName={username.split(" ")[0].toLowerCase()}
          />
        );
      })}
    </div>
  );
};

export default ContactList;
