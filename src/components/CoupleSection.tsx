'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Instagram } from 'lucide-react';

interface PersonInfo {
	name: string;
	fullName: string;
	father: string;
	mother: string;
	childOrder: string;
	photo: string;
	instagram: string;
}

function ShimmerOverlay() {
	return (
		<motion.div
			className='pointer-events-none absolute inset-0'
			initial={{ x: '-150%', y: '-150%' }}
			animate={{ x: '150%', y: '150%' }}
			transition={{
				duration: 3.5,
				repeat: Infinity,
				ease: 'easeInOut',
				repeatDelay: 1.5,
			}}
		>
			<div
				className='h-full w-full'
				style={{
					background: `linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.12) 47%, rgba(255,255,255,0.06) 50%, transparent 65%)`,
				}}
			/>
		</motion.div>
	);
}

function CornerSparkle({ className }: { className: string }) {
	return (
		<motion.div
			className={`pointer-events-none absolute text-[8px] sm:text-[10px] ${className}`}
			style={{ color: 'var(--primary)', opacity: 0.5 }}
			animate={{ opacity: [0.3, 0.7, 0.3], rotate: [0, 15, 0] }}
			transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
		>
			✦
		</motion.div>
	);
}

function PersonCard({ person, index }: { person: PersonInfo; index: number }) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-80px' });

	return (
		<motion.div
			ref={ref}
			className='flex flex-col items-center text-center'
			initial={{ opacity: 0, y: 50 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.8, delay: index * 0.3 }}
		>
			{/* Photo frame */}
			<motion.div
				className='relative mb-4 sm:mb-6'
				whileHover={{ scale: 1.03 }}
				transition={{ type: 'spring', stiffness: 300 }}
			>
				{/* Breathing glow */}
				<motion.div
					className='relative w-36 sm:w-52 aspect-[4/5] rounded-2xl overflow-hidden'
					style={{
						border: '4px solid',
						borderColor: 'var(--primary-light)',
					}}
					animate={{
						boxShadow: [
							`0 4px 28px color-mix(in srgb, var(--primary) 18%, transparent), 0 1px 3px rgba(0,0,0,0.06)`,
							`0 6px 38px color-mix(in srgb, var(--primary-light) 32%, transparent), 0 1px 6px rgba(0,0,0,0.1)`,
							`0 4px 28px color-mix(in srgb, var(--primary) 18%, transparent), 0 1px 3px rgba(0,0,0,0.06)`,
						],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				>
					{person.photo ? (
						<>
							<img
								src={person.photo}
								alt={person.fullName}
								className='h-full w-full object-cover block'
							/>
							<ShimmerOverlay />
						</>
					) : (
						<div
							className='flex h-full w-full items-center justify-center'
							style={{
								background: `linear-gradient(135deg, color-mix(in srgb, var(--primary-light) 15%, var(--bg-alt)), var(--bg-dark))`,
							}}
						>
							<span
								className='font-[family-name:var(--font-playfair)] text-4xl sm:text-6xl italic leading-none'
								style={{ color: 'var(--primary)', opacity: 0.85 }}
							>
								{person.name.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</motion.div>

				{/* Corner accents */}
				<CornerSparkle className='-top-1.5 -left-1.5' />
				<CornerSparkle className='-top-1.5 -right-1.5' />
				<CornerSparkle className='-bottom-1.5 -left-1.5' />
				<CornerSparkle className='-bottom-1.5 -right-1.5' />
			</motion.div>

			{/* Ribbon backdrop for name */}
			<div className='relative w-[130px] sm:w-[280px] mx-auto'>
				<motion.div
					className='absolute -inset-x-1 inset-y-0 sm:-inset-x-3 -skew-y-1 rounded-sm'
					style={{
						background: `linear-gradient(135deg, color-mix(in srgb, var(--primary-light) 20%, var(--bg-alt)), color-mix(in srgb, var(--primary) 12%, var(--bg-alt)))`,
						borderTop: `1px solid color-mix(in srgb, var(--primary-light) 30%, transparent)`,
						borderBottom: `1px solid color-mix(in srgb, var(--primary-light) 30%, transparent)`,
					}}
					initial={{ opacity: 0, scaleX: 0 }}
					animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
					transition={{
						delay: index * 0.3 + 0.4,
						duration: 0.5,
						ease: 'easeOut',
					}}
				/>
				<motion.div
					className='absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 h-3 w-1 sm:h-6 sm:w-2 rounded-r-sm'
					style={{ backgroundColor: 'var(--primary)', opacity: 0.4 }}
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 0.4 } : {}}
					transition={{ delay: index * 0.3 + 0.5 }}
				/>
				<motion.div
					className='absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 h-3 w-1 sm:h-6 sm:w-2 rounded-l-sm'
					style={{ backgroundColor: 'var(--primary)', opacity: 0.4 }}
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 0.4 } : {}}
					transition={{ delay: index * 0.3 + 0.5 }}
				/>
				<motion.h3
					className='relative font-[family-name:var(--font-playfair)] text-[11px] sm:text-lg md:text-xl font-light italic tracking-wide leading-tight px-2 py-1 sm:px-4 sm:py-2 text-center'
					style={{ color: 'var(--text)' }}
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ delay: index * 0.3 + 0.45, duration: 0.4 }}
				>
					{person.fullName}
				</motion.h3>
			</div>

			<motion.div
				className='mt-1.5 sm:mt-2 flex items-center justify-center gap-1.5 sm:gap-2'
				initial={{ opacity: 0, scaleX: 0 }}
				animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
				transition={{ delay: index * 0.3 + 0.55, duration: 0.4 }}
			>
				<span
					className='h-px w-3 sm:w-6'
					style={{ backgroundColor: 'var(--primary)', opacity: 0.2 }}
				/>
				<span
					className='text-[7px] sm:text-[10px]'
					style={{ color: 'var(--primary)', opacity: 0.4 }}
				>
					✦
				</span>
				<span
					className='h-px w-3 sm:w-6'
					style={{ backgroundColor: 'var(--primary)', opacity: 0.2 }}
				/>
			</motion.div>

			{(person.father || person.mother) && (
				<motion.div
					className='mt-1.5 sm:mt-3 space-y-0 sm:space-y-0.5'
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ delay: index * 0.3 + 0.65 }}
				>
					{person.childOrder && (
						<p
							className='font-[family-name:var(--font-cormorant)] text-[10px] sm:text-sm'
							style={{ color: 'var(--text)', opacity: 0.5 }}
						>
							{person.childOrder} dari
						</p>
					)}
					{person.father && (
						<p
							className='font-[family-name:var(--font-lora)] text-[10px] sm:text-sm'
							style={{ color: 'var(--text)', opacity: 0.8 }}
						>
							{person.father}
						</p>
					)}
					{person.father && person.mother && (
						<p
							className='font-[family-name:var(--font-cormorant)] text-[9px] sm:text-xs'
							style={{ color: 'var(--text)', opacity: 0.3 }}
						>
							&
						</p>
					)}
					{person.mother && (
						<p
							className='font-[family-name:var(--font-lora)] text-[10px] sm:text-sm'
							style={{ color: 'var(--text)', opacity: 0.8 }}
						>
							{person.mother}
						</p>
					)}
				</motion.div>
			)}

			{person.instagram && (
				<motion.a
					href={`https://instagram.com/${person.instagram.replace('@', '')}`}
					target='_blank'
					rel='noopener noreferrer'
					className='mt-1.5 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 font-[family-name:var(--font-cormorant)] text-[10px] sm:text-sm transition-colors'
					style={{ color: 'var(--primary)' }}
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ delay: index * 0.3 + 0.85 }}
				>
					<Instagram className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
					{person.instagram}
				</motion.a>
			)}
		</motion.div>
	);
}

export default function CoupleSection({
	groom,
	bride,
}: {
	groom: PersonInfo;
	bride: PersonInfo;
}) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-80px' });

	return (
		<section
			ref={ref}
			className='relative py-28'
			style={{ backgroundColor: 'var(--bg-alt)' }}
		>
			<div className='mx-auto max-w-4xl px-4 sm:px-6'>
				<motion.div
					className='mb-16 sm:mb-20 text-center'
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ duration: 0.6 }}
				>
					<p
						className='font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase'
						style={{ color: 'var(--secondary)' }}
					>
						Mempelai
					</p>
					<div className='ornament-divider mt-4'>
						<Heart
							className='h-4 w-4'
							style={{ color: 'var(--primary)', fill: 'var(--primary)' }}
						/>
					</div>
				</motion.div>

				<div className='grid grid-cols-2 gap-4 sm:gap-6 lg:gap-10'>
					<PersonCard person={groom} index={0} />
					<PersonCard person={bride} index={1} />
				</div>
			</div>
		</section>
	);
}
