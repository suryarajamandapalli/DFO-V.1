import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function CTASection() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  return (
    <section className="py-24 relative overflow-hidden bg-sky-600">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[140%] bg-blue-500 rounded-full blur-[100px] opacity-50" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Start Managing Patient Journeys Smarter
          </h2>
          <p className="text-sky-100 text-lg md:text-xl mb-10">
            Equip your clinic with the intelligence and operational efficiency of the JanmaSethu Digital Front Office.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => user ? navigate(`/dashboard/${profile?.role || 'cro'}`) : navigate('/login')}
              className="bg-white text-sky-600 hover:bg-slate-50 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              {user ? 'My Dashboard' : 'Login to DFO'}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/signup')}
              className="border-sky-300 text-white hover:bg-sky-500 hover:border-white"
            >
              Request Platform Access
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
