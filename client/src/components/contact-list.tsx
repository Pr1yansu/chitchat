import Contact from "@/components/contact";
import { User } from "@/types";

interface ContactListProps {
  contacts?: User[];
}

const ContactList = ({ contacts }: ContactListProps) => {
  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-slate-50/30 px-3 overflow-y-scroll flex-1  pb-4"
      id="contact-list"
    >
      {contacts.map((contact) => (
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
        />
      ))}
    </div>
  );
};

export default ContactList;
