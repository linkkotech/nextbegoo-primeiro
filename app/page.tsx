export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Begoo - Console de Gestão
        </h1>
        <p className="text-gray-600 mb-8">
          Infraestrutura Digital Multi-tenant para Comércio Local
        </p>
        <div className="space-x-4">
          <a
            href="/console"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Acessar Console
          </a>
        </div>
      </div>
    </div>
  );
}
