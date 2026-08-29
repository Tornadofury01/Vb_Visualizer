import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const GITHUB_REPO = 'https://github.com/Tornadofury01/Vb_Visualizer';
const editBase = `${GITHUB_REPO}/tree/main/website/`;

const config: Config = {
  title: 'VB Visualizer',
  tagline: '3D volleyball court play visualizer',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://tornadofury01.github.io',
  baseUrl: '/',

  organizationName: 'Tornadofury01',
  projectName: 'Vb_Visualizer',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        // Developer guide (default docs instance).
        docs: {
          path: 'developer',
          routeBasePath: 'developer',
          sidebarPath: './sidebars.developer.ts',
          editUrl: editBase,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'user',
        path: 'user-docs',
        routeBasePath: 'user',
        sidebarPath: './sidebars.user.ts',
        editUrl: editBase,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'VB Visualizer',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'developerSidebar',
          position: 'left',
          label: 'Developer',
        },
        {
          type: 'docSidebar',
          sidebarId: 'userSidebar',
          docsPluginId: 'user',
          position: 'left',
          label: 'User Guide',
        },
        {
          href: GITHUB_REPO,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Developer guide', to: '/developer/intro'},
            {label: 'User guide', to: '/user/intro'},
          ],
        },
        {
          title: 'Project',
          items: [{label: 'GitHub', href: GITHUB_REPO}],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} VB Visualizer. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
