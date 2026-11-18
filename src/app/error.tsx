"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container page-head"><h1>We couldn’t load this page.</h1><p>Please try again. If the problem continues, check the service configuration.</p><button className="button button-primary" onClick={reset}>Try again</button></div>; }
