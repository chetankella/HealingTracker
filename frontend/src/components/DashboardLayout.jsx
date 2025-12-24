import Layout from './Layout';

const DashboardLayout = ({ children, userType, userName, hospitalName, title, subtitle }) => {
  return (
    <Layout userType={userType} userName={userName} hospitalName={hospitalName}>
      <div className="space-y-8 xl:space-y-12">
        {/* Dashboard Header */}
        <div className="text-center xl:text-left">
          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-lg xl:text-xl">
            {subtitle}
          </p>
        </div>
        
        {/* Dashboard Content */}
        <div className="xl:max-w-none">
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardLayout;








