import { createContactAction } from "@/app/projects/actions";
import { CONTACT_ROLES, type Contact } from "@/lib/types";

type ContactListProps = {
  projectId: string;
  contacts: Contact[];
  disabled?: boolean;
};

export function ContactList({ projectId, contacts, disabled = false }: ContactListProps) {
  return (
    <section className="card stack-md">
      <div className="section-header">
        <div>
          <h2>Contacts</h2>
          <p>Keep project-related people and their details together.</p>
        </div>
      </div>

      <div className="stack-sm">
        {contacts.length === 0 ? <p className="muted">No contacts added yet.</p> : null}
        {contacts.map((contact) => (
          <article key={contact.id} className="list-card">
            <div className="list-card-header">
              <strong>{contact.name}</strong>
              <span className="badge badge-info">{contact.role}</span>
            </div>
            <p className="meta-line">
              {[contact.organization, contact.email, contact.phone].filter(Boolean).join(" • ")}
            </p>
            {contact.notes ? <p>{contact.notes}</p> : null}
          </article>
        ))}
      </div>

      <form action={createContactAction} className="stack-md form-subsection">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="grid-two">
          <label className="field">
            <span>Name</span>
            <input name="name" required disabled={disabled} />
          </label>
          <label className="field">
            <span>Role</span>
            <select name="role" defaultValue="Client Contact" disabled={disabled}>
              {CONTACT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid-two">
          <label className="field">
            <span>Organization</span>
            <input name="organization" disabled={disabled} />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" disabled={disabled} />
          </label>
        </div>
        <div className="grid-two">
          <label className="field">
            <span>Phone</span>
            <input name="phone" disabled={disabled} />
          </label>
          <label className="field">
            <span>Notes</span>
            <input name="notes" disabled={disabled} />
          </label>
        </div>
        <div className="form-actions">
          <button className="button" type="submit" disabled={disabled}>
            Add contact
          </button>
        </div>
      </form>
    </section>
  );
}
