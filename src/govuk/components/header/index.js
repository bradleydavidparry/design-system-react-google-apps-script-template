import React, { useEffect, useRef } from 'react';

import { Link } from '../../../utils/Link';

function Header(props) {
  const {
    className,
    containerClassName,
    homepageUrlHref,
    homepageUrlTo,
    navigation,
    navigationClassName,
    productName,
    serviceName,
    serviceUrlHref,
    serviceUrlTo,
    navigationLabel,
    menuButtonLabel,
    // eslint-disable-next-line no-unused-vars
    assetsPath, // We don't want this, but just in case someone passes it, we don't want it to arrive as an attribute on the header
    ...attributes
  } = props;

  const headerRef = useRef();
  let productNameComponent;
  let navigationComponent;

  if (productName) {
    productNameComponent = (
      <span className="govuk-header__product-name">{productName}</span>
    );
  }

  if (serviceName || navigation) {
    navigationComponent = (
      <div className="govuk-header__content">
        {serviceName ? (
          <Link
            href={serviceUrlHref}
            to={serviceUrlTo}
            className="govuk-header__link govuk-header__link--service-name"
          >
            {serviceName}
          </Link>
        ) : null}

        {navigation ? (
          <>
            <button
              type="button"
              className="govuk-header__menu-button govuk-js-header-toggle"
              aria-controls="navigation"
              aria-label={menuButtonLabel}
            >
              Menu
            </button>
            <nav>
              <ul
                id="navigation"
                className={`govuk-header__navigation ${
                  navigationClassName || ''
                }`}
                aria-label={navigationLabel}
              >
                {navigation.map((item, index) => {
                  const {
                    active: itemActive,
                    className: itemClassName,
                    children: itemChildren,
                    reactListKey,
                    ...itemAttributes
                  } = item;

                  return itemChildren ? (
                    <li
                      key={reactListKey || index}
                      className={`govuk-header__navigation-item${
                        itemActive
                          ? ' govuk-header__navigation-item--active'
                          : ''
                      }`}
                    >
                      {item.href || item.to ? (
                        <Link
                          className={`govuk-header__link ${
                            itemClassName || ''
                          }`}
                          {...itemAttributes}
                        >
                          {itemChildren}
                        </Link>
                      ) : (
                        itemChildren
                      )}
                    </li>
                  ) : null;
                })}
              </ul>
            </nav>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <header
      className={`govuk-header ${className || ''}`}
      role="banner"
      data-module="govuk-header"
      {...attributes}
      ref={headerRef}
    >
      <div className={`govuk-header__container ${containerClassName}`}>
        <div className="govuk-header__logo" style={{width: "100%"}}>
          <Link
            to={homepageUrlTo}
            href={homepageUrlHref}
            className="govuk-header__link govuk-header__link--homepage"
          >
            <span className="govuk-header__logotype">
              {' '}
              <span className="govuk-header__logotype-text">Operational Data & Tools Team</span>
            </span>
            {productNameComponent}
          </Link>
        </div>
        {navigationComponent}
      </div>
    </header>
  );
}

Header.defaultProps = {
  homepageUrlHref: '/',
  containerClassName: 'govuk-width-container',
  navigationLabel: 'Navigation menu',
  menuButtonLabel: 'Show or hide navigation menu',
};

export { Header };
