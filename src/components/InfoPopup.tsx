'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

export default function InfoPopup() {
	const [visible, setVisible] = useState(true);
	const [progress, setProgress] = useState(100);

	useEffect(() => {
		if (!visible) return;
		const start = Date.now();
		const duration = 20000;
		const timer = setInterval(() => {
			const elapsed = Date.now() - start;
			const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
			setProgress(remaining);
			if (remaining <= 0) {
				clearInterval(timer);
				setVisible(false);
			}
		}, 30);
		return () => clearInterval(timer);
	}, [visible]);

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{ opacity: 0, x: -20, y: 20 }}
					animate={{ opacity: 1, x: 0, y: 0 }}
					exit={{ opacity: 0, x: -20, y: 20 }}
					transition={{ duration: 0.35, ease: 'easeOut' }}
					className='fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 max-w-[240px] sm:max-w-sm'
				>
					<div
						className='relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md shadow-lg'
						style={{
							border:
								'1px solid color-mix(in srgb, var(--primary-light) 15%, transparent)',
						}}
					>
						<button
							onClick={() => setVisible(false)}
							className='absolute right-1.5 top-1.5 sm:right-2 sm:top-2 rounded-full p-0.5 sm:p-1 transition-colors hover:bg-black/5'
						>
							<X
								className='h-3 w-3 sm:h-3.5 sm:w-3.5'
								style={{ color: 'var(--text)', opacity: 0.4 }}
							/>
						</button>

						<div className='px-3 py-3 pr-7 sm:px-4 sm:py-4 sm:pr-8'>
							<div className='flex items-start gap-2 sm:gap-3'>
								<div
									className='mt-0.5 flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-full'
									style={{
										backgroundColor:
											'color-mix(in srgb, var(--primary-light) 12%, transparent)',
									}}
								>
									<Info
										className='h-3 w-3 sm:h-3.5 sm:w-3.5'
										style={{ color: 'var(--primary)' }}
									/>
								</div>
								<div>
									<p
										className='font-[family-name:var(--font-playfair)] text-[11px] sm:text-sm font-semibold'
										style={{ color: 'var(--text)' }}
									>
										Informasi
									</p>
									<p
										className='mt-0.5 sm:mt-1 font-[family-name:var(--font-lora)] text-[10px] sm:text-xs leading-relaxed'
										style={{ color: 'var(--text)', opacity: 0.65 }}
									>
										Dengan penuh hormat, kami tidak mengadakan penerimaan tamu
										di rumah maupun di luar waktu acara tasyakuran.
									</p>
								</div>
							</div>
						</div>

						{/* Progress bar */}
						<div
							className='h-0.5 sm:h-1 w-full'
							style={{
								backgroundColor:
									'color-mix(in srgb, var(--primary-light) 10%, transparent)',
							}}
						>
							<motion.div
								className='h-full rounded-full'
								style={{
									width: `${progress}%`,
									background: `linear-gradient(to right, var(--primary-light), var(--primary))`,
								}}
							/>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
