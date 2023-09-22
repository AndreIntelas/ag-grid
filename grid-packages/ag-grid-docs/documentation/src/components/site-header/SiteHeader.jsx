import classnames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useState } from 'react';
import supportedFrameworks from 'utils/supported-frameworks.js';
import breakpoints from '../../design-system/breakpoint.module.scss';
import LogoType from '../../images/inline-svgs/ag-grid-logotype.svg';
import MenuIcon from '../../images/inline-svgs/menu-icon.svg';
import { useWindowSize } from '../../utils/use-window-size';
import { Collapsible } from '../Collapsible';
import { Icon } from '../Icon';
import LogoMark from '../LogoMark';
import styles from './SiteHeader.module.scss';

const IS_SSR = typeof window === 'undefined';

const SITE_HEADER_SMALL_WIDTH = parseInt(breakpoints['site-header-small'], 10);

const links = [
    {
        name: 'Demo',
        url: '/example',
    },
    {
        name: 'Documentation',
        url: withPrefix('/documentation/'),
    },
    // {
    //     name: 'Theme Builder',
    //     url: '/theme-builder',
    // },
    {
        name: 'Pricing',
        url: '/license-pricing',
    },
    {
        name: 'Blog',
        url: 'https://blog.ag-grid.com/',
    },
    {
        name: 'Github',
        url: 'https://github.com/ag-grid/ag-grid',
        icon: <Icon name="github" />,
        cssClass: 'github-item',
    },
];

const getCurrentPageName = (path) => {
    const rawPath = path.split('/')[1];

    const allLinks = [
        ...links,
        ...supportedFrameworks.map((framework) => ({ name: 'Documentation', url: `/${framework}-data-grid` })),
    ];

    const match = allLinks.filter((link) => link.url.includes(rawPath));

    if (match && match.length === 1) {
        return match[0].name;
    }
};

const HeaderLinks = ({ path, isOpen, toggleIsOpen }) => {
    return (
        <ul className={classnames(styles.navItemList, 'list-style-none')}>
            {links.map((link) => {
                const linkClasses = classnames(styles.navItem, {
                    [styles.navItemActive]: link.name === getCurrentPageName(path),
                    [styles[link.cssClass]]: link.cssClass,
                });

                return (
                    <li key={link.name.toLocaleLowerCase()} className={linkClasses}>
                        <a
                            className={styles.navLink}
                            href={link.url}
                            onClick={() => {
                                if (isOpen) {
                                    toggleIsOpen();
                                }
                            }}
                            aria-label={`AG Grid ${link.name}`}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
};

const HeaderExpandButton = ({ isOpen, toggleIsOpen }) => (
    <button
        className={styles.mobileMenuButton}
        type="button"
        aria-controls={styles.mainNav}
        aria-expanded={isOpen.toString()}
        aria-label="Toggle navigation"
        onClick={() => toggleIsOpen && toggleIsOpen()}
    >
        <MenuIcon className={styles.menuIcon} />
    </button>
);

const SSRHeaderNav = ({ isOpen, toggleIsOpen, path }) => {
    return <>
        <HeaderExpandButton isOpen={isOpen} toggleIsOpen={toggleIsOpen}  />
        <nav id={styles.mainNav} style={{
            overflow: isOpen ? 'visible' : 'hidden',
            height: isOpen ? 'auto' : '0px'
        }}>
            <HeaderLinks path={path} isOpen={isOpen} toggleIsOpen={toggleIsOpen} />
        </nav>
    </>
}

const HeaderNav = ({ path }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { width } = useWindowSize();
    const isDesktop = width >= SITE_HEADER_SMALL_WIDTH;

    const toggleIsOpen = () => {
        setIsOpen((currentIsOpen) => {
            return !currentIsOpen;
        });
    };

    return (
        <>
            {IS_SSR && <SSRHeaderNav isOpen={isOpen} toggleIsOpen={toggleIsOpen} path={path} />}
            {!IS_SSR && (
                <>
                    <HeaderExpandButton isOpen={isOpen} toggleIsOpen={toggleIsOpen} />
                    <Collapsible id={styles.mainNav} isDisabled={isDesktop} isOpen={isOpen}>
                        <nav id={isDesktop ? styles.mainNav : undefined}>
                            <HeaderLinks path={path} isOpen={isOpen} toggleIsOpen={toggleIsOpen} />
                        </nav>
                    </Collapsible>
                </>
            )}
        </>
    );
};

export const SiteHeader = ({ path }) => {
    const [isLogoHover, setIsLogoHover] = useState(false);
    return (
        <header className={styles.header}>
            <div className={classnames(styles.headerInner, 'page-margin')}>
                <a
                    href="/"
                    aria-label="Home"
                    className={styles.headerLogo}
                    onMouseEnter={() => {
                        setIsLogoHover(true);
                    }}
                    onMouseLeave={() => {
                        setIsLogoHover(false);
                    }}
                >
                    <LogoType />
                    <LogoMark bounce={isLogoHover} />
                </a>

                <HeaderNav path={path} />
            </div>
        </header>
    );
};
