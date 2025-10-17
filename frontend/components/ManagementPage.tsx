import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';

const AddProductForm: React.FC = () => {
    const { addProduct } = useProducts();
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newProduct: Product = {
            id,
            name,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
        };

        if (!id || !name || isNaN(newProduct.price) || isNaN(newProduct.stock)) {
            alert("Veuillez remplir tous les champs correctement.");
            return;
        }

        if (addProduct(newProduct)) {
            // Reset form
            setId('');
            setName('');
            setPrice('');
            setStock('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ajouter un Produit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="qr-code" className="block text-sm font-medium text-gray-700">Code QR (ID unique)</label>
                    <input type="text" id="qr-code" value={id} onChange={(e) => setId(e.target.value)} placeholder="Scanner ou entrer le code" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Nom du produit</label>
                    <input type="text" id="product-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Bouteille d'eau" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Prix (€)</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1.50" step="0.01" min="0" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Initial</label>
                        <input type="number" id="stock" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="100" min="0" step="1" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Enregistrer le Produit
                </button>
            </form>
        </div>
    );
}

const ProductList: React.FC = () => {
    const { products, updateStock } = useProducts();

    const handleStockChange = (id: string, currentStock: number) => {
        const newStockStr = prompt(`Modifier le stock pour ce produit (actuel: ${currentStock}):`, String(currentStock));
        if (newStockStr !== null) {
            const newStock = parseInt(newStockStr, 10);
            if (!isNaN(newStock) && newStock >= 0) {
                updateStock(id, newStock);
            } else {
                alert("Veuillez entrer un nombre valide pour le stock.");
            }
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Liste des Produits</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code QR</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Aucun produit enregistré.</td>
                            </tr>
                        )}
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{product.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{product.price.toFixed(2)} €</td>
                                <td 
                                    className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold cursor-pointer"
                                    onClick={() => handleStockChange(product.id, product.stock)}
                                    title="Cliquer pour modifier le stock"
                                >
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {product.stock}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


const IntegrationInfo: React.FC = () => {
    return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg shadow-md mt-8">
            <div className="flex">
                <div className="py-1">
                    <svg className="h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-lg font-bold text-blue-800">Intégration QRbot & Déploiement</p>
                    <p className="mt-2 text-sm text-blue-700">
                        Pour que les scans de <strong>QRbot</strong> apparaissent ici en temps réel, un service backend est nécessaire. Cette application front-end ne peut pas recevoir directement les requêtes de QRbot.
                    </p>
                    <div className="mt-3 bg-gray-100 p-3 rounded text-xs text-gray-700 font-mono">
                        <p><strong>Configuration QRbot :</strong></p>
                        <p><strong>URL :</strong> https://votre-backend.com/api/scan</p>
                        <p><strong>Méthode :</strong> POST</p>
                        <p><strong>Body :</strong> {"{\"contenu\": \"{code}\"}"}</p>
                    </div>
                    <p className="mt-2 text-sm text-blue-700">
                        Votre backend devra ensuite envoyer le code scanné à cette application via une connexion <strong>WebSocket</strong>.
                    </p>
                     <p className="mt-4 text-sm text-blue-700">
                        <strong>Déploiement Gratuit :</strong> Pour tester cette application en ligne, vous pouvez déployer ce front-end gratuitement sur des services comme <strong>Vercel</strong>, <strong>Netlify</strong> ou <strong>GitHub Pages</strong>. Pour le backend, des plateformes comme <strong>Vercel (Serverless Functions)</strong> ou <strong>Render</strong> sont d'excellentes options gratuites.
                    </p>
                </div>
            </div>
        </div>
    );
}

const ManagementPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddProductForm />
        </div>
        <div className="lg:col-span-2">
          <ProductList />
        </div>
      </div>
      <IntegrationInfo />
    </div>
  );
};

export default ManagementPage;
