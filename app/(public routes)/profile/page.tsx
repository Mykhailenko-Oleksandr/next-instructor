import Link from "next/link";

const Profile = () => {
  return (
    <section>
      <h1>My Profile</h1>
      <h2>Name: User name</h2>
      <p>
        Some description: Lorem, ipsum dolor sit amet consectetur adipisicing
        elit. Cumque non quis, vero consectetur eum at commodi facere error,
        laborum, rerum labore corrupti neque veritatis sed minima et nam. Autem,
        cumque.
      </p>

      <Link href="/profile/edit">Edit profile</Link>
    </section>
  );
};

export default Profile;
