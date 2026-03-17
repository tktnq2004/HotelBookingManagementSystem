import Home from "./pages/Home";

function App() {
  return (
    <Home
      onViewRoom={(room) => console.log("View", room)}
      onBookNow={(room) => console.log("Book", room)}
      onMyBookings={() => console.log("My bookings")}
    />
  );
}
export default App;