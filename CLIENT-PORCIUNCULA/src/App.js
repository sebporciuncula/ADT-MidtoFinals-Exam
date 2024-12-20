  import './App.css';
  import { createBrowserRouter, RouterProvider } from 'react-router-dom';
  import Main from './pages/Main/Main';
  import Home from './pages/Main/Movie/Home/Home';
  import View from './pages/Main/Movie/View/View';
  import Login from './pages/Public/Login/Login'; 
  import Register from './pages/Public/Register/Register'; 
  import MovieContextProvider from './context/MovieContext';

  const router = createBrowserRouter([
    { path: '/', element: <Login /> }, 
    { path: '/register', element: <Register /> }, 
    {
      path: '/main',
      element: <Main />, 
      children: [
        { path: '/main', element: <Home /> }, 
        { path: 'view/:movieId', element: <View /> }, 
      ],
    },
  ]);

  function App() {
    return (
      <div className='App'>
        <MovieContextProvider>
          <RouterProvider router={router} />
        </MovieContextProvider>
      </div>
    );
  }

  export default App;
