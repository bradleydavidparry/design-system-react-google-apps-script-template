import React, { useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { SkipLink } from '../components/skip-link/index';
import { Header } from '../components/header/index';
import { Footer } from '../components/footer/index';
import AppContext from '../../js/views/AppContext';

function Template(props) {
  const {
    children,
    title,
    skiplink,
    header,
    footer,
    beforeContent,
    mainLang,
    containerClassName,
    mainClassName,
    themeColor,
    strapline
  } = props;

  const { loading } = useContext(AppContext)

  useEffect(() => {
    document.documentElement.classList.add('govuk-template');
    document.body.classList.add('js-enabled', 'govuk-template__body');
  }, []);

  return (
    <>
      <Helmet>
        <meta charset="utf-8" />
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0b0c0c" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Helmet>

      <SkipLink {...skiplink} />

      <Header {...header} />

      <div className={`govuk-width-container ${containerClassName || ''}`}>
      <div className="outdent-to-full-viewport-width brand-performance">
      <div className="outdent-to-full-viewport-width-inner hero-banner vertical-padding-medium">
       <h1 className="hero-banner-heading">
        {title}
       </h1>
       <div className="hero-banner-strapline">
        {strapline}
       </div>
      </div>
     </div>
        {beforeContent}
        <main
          className={`govuk-main-wrapper ${mainClassName || ''}`}
          id="main-content"
          role="main"
          lang={mainLang || null}
          style={{paddingTop: "0px"}}
        >
          {loading ? null : children}
        </main>
      </div>

      <Footer {...footer} />
    </>
  );
}

export { Template };
