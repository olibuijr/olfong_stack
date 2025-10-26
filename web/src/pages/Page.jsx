import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { fetchPageBySlug, clearCurrentPage } from '../store/slices/pagesSlice';
import { ChevronRight, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Page = () => {
  const { slug } = useParams();
  const { currentLanguage } = useLanguage();
  const dispatch = useDispatch();
  const { currentPage, isLoading, error } = useSelector((state) => state.pages);

  useEffect(() => {
    if (slug) {
      dispatch(fetchPageBySlug(slug));
    }

    return () => {
      dispatch(clearCurrentPage());
    };
  }, [slug, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentLanguage === 'is' ? 'Síða fannst ekki' : 'Page not found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {currentLanguage === 'is'
                ? 'Vertu sáð(ur), en við gætum ekki fundið þessa síðu.'
                : 'Sorry, we could not find this page.'}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {currentLanguage === 'is' ? 'Til baka á heimasíðu' : 'Back to home'}
              <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Get content based on current language
  const pageContent = currentLanguage === 'is' ? currentPage.contentIs : currentPage.content;
  const pageTitle = currentLanguage === 'is' ? currentPage.titleIs : currentPage.title;
  const metaTitle = currentLanguage === 'is' ? currentPage.metaTitleIs : currentPage.metaTitle;
  const metaDescription = currentLanguage === 'is' ? currentPage.metaDescriptionIs : currentPage.metaDescription;

  // Parse Slate content
  let parsedContent = [];
  try {
    parsedContent = typeof pageContent === 'string' ? JSON.parse(pageContent) : pageContent;
  } catch (e) {
    console.error('Error parsing page content:', e);
    parsedContent = [];
  }

  return (
    <>
      <Helmet>
        <title>{metaTitle || pageTitle} | Ölföng</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {currentPage.canonicalUrl && <link rel="canonical" href={currentPage.canonicalUrl} />}
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Featured Image */}
        {currentPage.featuredImage && (
          <div className="w-full h-80 overflow-hidden">
            <img
              src={currentPage.featuredImage.url}
              alt={currentPage.featuredImage.alt || pageTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Page Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {pageTitle}
          </h1>

          {/* Page Body */}
          <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <SlateContentRenderer content={parsedContent} />
          </div>

          {/* Back Link */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
            >
              <ChevronRight size={20} className="rotate-180" />
              {currentLanguage === 'is' ? 'Til baka á heimasíðu' : 'Back to home'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

// Component to render Slate content
const SlateContentRenderer = ({ content }) => {
  if (!Array.isArray(content)) return null;

  return (
    <>
      {content.map((block, idx) => (
        <SlateBlockRenderer key={idx} block={block} />
      ))}
    </>
  );
};

// Render individual Slate blocks
const SlateBlockRenderer = ({ block }) => {
  if (!block || !block.children) return null;

  switch (block.type) {
    case 'heading-one':
      return (
        <h1 className="text-4xl font-bold mt-8 mb-4">
          <SlateLeafRenderer leaves={block.children} />
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="text-3xl font-bold mt-7 mb-3">
          <SlateLeafRenderer leaves={block.children} />
        </h2>
      );
    case 'heading-three':
      return (
        <h3 className="text-2xl font-bold mt-6 mb-3">
          <SlateLeafRenderer leaves={block.children} />
        </h3>
      );
    case 'block-quote':
      return (
        <blockquote className="border-l-4 border-gray-400 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
          <SlateLeafRenderer leaves={block.children} />
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul className="list-disc list-inside my-4 space-y-2">
          {block.children.map((item, idx) =>
            item.type === 'list-item' ? (
              <li key={idx} className="ml-4">
                <SlateLeafRenderer leaves={item.children} />
              </li>
            ) : null
          )}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol className="list-decimal list-inside my-4 space-y-2">
          {block.children.map((item, idx) =>
            item.type === 'list-item' ? (
              <li key={idx} className="ml-4">
                <SlateLeafRenderer leaves={item.children} />
              </li>
            ) : null
          )}
        </ol>
      );
    case 'code-block':
      return (
        <pre className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
          <code>
            <SlateLeafRenderer leaves={block.children} />
          </code>
        </pre>
      );
    case 'image':
      return (
        <img
          src={block.url}
          alt={block.alt || 'Image'}
          className="max-w-full h-auto my-4 rounded-lg"
        />
      );
    case 'link':
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          <SlateLeafRenderer leaves={block.children} />
        </a>
      );
    default:
      return (
        <p className="my-4 leading-relaxed">
          <SlateLeafRenderer leaves={block.children} />
        </p>
      );
  }
};

// Render leaf (text) content with formatting
const SlateLeafRenderer = ({ leaves }) => {
  if (!Array.isArray(leaves)) return leaves;

  return (
    <>
      {leaves.map((leaf, idx) => {
        // Apply all formatting styles together
        if (leaf.bold || leaf.italic || leaf.underline || leaf.code) {
          const className = [
            leaf.bold && 'font-bold',
            leaf.italic && 'italic',
            leaf.underline && 'underline',
            leaf.code && 'bg-gray-200 dark:bg-gray-800 px-1 rounded font-mono text-sm',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <span key={idx} className={className}>
              {leaf.text}
            </span>
          );
        }

        return <span key={idx}>{leaf.text || ''}</span>;
      })}
    </>
  );
};

export default Page;
