import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Welcome</p>
        <h1>Student Feedback System</h1>
        <p className="hero-text">
          Your voice helps make our school better. Share a suggestion, report a concern, or say thank you
          to the people who made your day. Every message is stored securely in the cloud and reviewed by the
          school administrator.
        </p>
        <div className="hero-actions">
          <Link to="/submit" className="btn btn-primary">Submit Feedback</Link>
          <Link to="/feedback" className="btn btn-secondary">View Feedback</Link>
        </div>
      </section>

      <section className="grid grid-3">
        <article className="card tint-lavender">
          <h3>Suggestions</h3>
          <p>Have an idea to improve classes, facilities, or student life? Tell us about it.</p>
        </article>
        <article className="card tint-peach">
          <h3>Complaints</h3>
          <p>Something is not working well? Let the administration know so it can be fixed.</p>
        </article>
        <article className="card tint-mint">
          <h3>Appreciation</h3>
          <p>Recognize teachers, staff, and classmates who deserve a thank you.</p>
        </article>
      </section>
    </>
  );
}
