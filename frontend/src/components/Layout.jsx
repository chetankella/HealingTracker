import Header from './Header';

const Layout = ({ children, userType, userName, hospitalName }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userType={userType} 
        userName={userName} 
        hospitalName={hospitalName} 
      />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
