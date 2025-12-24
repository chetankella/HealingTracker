import { Link } from 'react-router-dom';

const NavigationCard = ({ icon: Icon, label, link, count, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700",
    green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    orange: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
    purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
    red: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
  };

  return (
    <Link 
      to={link}
      className={`
        block p-6 xl:p-8 rounded-2xl border-2 transition-all duration-200 
        transform hover:scale-105 hover:shadow-lg
        ${colorClasses[color] || colorClasses.indigo}
      `}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-3 xl:p-4 rounded-full bg-white shadow-sm">
          <Icon className="h-8 w-8 xl:h-10 xl:w-10" />
        </div>
        <div>
          <h3 className="font-semibold text-lg xl:text-xl">{label}</h3>
          {count !== undefined && (
            <p className="text-sm opacity-75 mt-1">{count} items</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NavigationCard;
