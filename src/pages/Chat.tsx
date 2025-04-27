
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';

const Chat = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col py-4 px-4 max-w-[550px] mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Water Quality Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about water quality, pollutants, testing methods, and more.
          </p>
        </div>
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
